# Phase 4: Instances + MCP Foundation - Research

**Researched:** 2026-01-29
**Domain:** UAZAPI WhatsApp Integration + MCP Tool Infrastructure
**Confidence:** HIGH

## Summary

This phase involves implementing a WhatsApp instance management interface with UAZAPI integration and establishing the MCP (Model Context Protocol) tool infrastructure. Research revealed that the original project (`C:\Users\Pichau\Desktop\Projetos\Sincron\sincron-grupos`) already contains a fully functional implementation of UAZAPI integration including API routes, service layer, types, and connection pages. The UAZAPI OpenAPI specification (`uazapi-openapi-spec.yaml`) is available locally and provides comprehensive documentation for all required endpoints.

The new project already has the foundation components (Radix UI, shadcn/ui, Supabase client patterns, toast system) established in previous phases. The primary work is adapting the proven logic from the original project into the new card-based UI design specified in CONTEXT.md, with additional requirements for connection history and MCP discovery endpoint.

**Primary recommendation:** Port the existing UAZAPI service layer (`lib/uazapi/`) from the original project, then build the new card-based UI using existing shadcn components (Card, Badge, Collapsible, Sheet/Drawer for modals).

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/ssr` | ^0.8.0 | Server/client Supabase | Already in project, handles auth and DB |
| `sonner` | ^2.0.7 | Toast notifications | Already in project, used for feedback |
| `lucide-react` | ^0.563.0 | Icons | Already in project |
| `next/image` | 16.1.6 | QR code display | Native Next.js, optimized images |
| `zod` | ^4.3.6 | Schema validation | Already in project, for API validation |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@radix-ui/react-dialog` | via shadcn | QR code modal | Already available via Sheet component |
| `@radix-ui/react-collapsible` | ^1.1.12 | History dropdown | Already in project for expandable content |
| `framer-motion` | ^12.29.2 | Animations | Optional for status transitions |
| `vaul` | ^1.1.2 | Drawer (mobile) | Already in project for mobile modals |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Sheet for modal | AlertDialog | Sheet allows custom content, AlertDialog is for confirmations |
| Polling | WebSocket | Polling simpler, WebSocket overkill for 30s interval |
| Custom fetch | axios | Native fetch sufficient, original project uses fetch |

**Installation:**
No new packages needed - all required dependencies already installed.

## Architecture Patterns

### Recommended Project Structure
```
app/
├── dashboard/
│   └── instances/
│       ├── page.tsx              # Instance list (cards)
│       └── [id]/
│           └── page.tsx          # Instance detail (optional)
├── api/
│   ├── uazapi/                   # UAZAPI proxy routes
│   │   └── instances/
│   │       ├── route.ts          # POST create instance
│   │       └── [token]/
│   │           ├── route.ts      # Instance operations
│   │           ├── connect/
│   │           │   └── route.ts  # GET/POST QR code
│   │           ├── status/
│   │           │   └── route.ts  # GET status
│   │           ├── disconnect/
│   │           │   └── route.ts  # POST disconnect
│   │           └── webhook/
│   │               └── route.ts  # POST configure webhook
│   └── mcp/
│       └── route.ts              # MCP discovery endpoint
components/
├── instances/
│   ├── instance-card.tsx         # Single instance card component
│   ├── instance-list.tsx         # Grid of instance cards
│   ├── instance-history.tsx      # Collapsible history dropdown
│   ├── qr-code-modal.tsx         # QR code connection modal
│   └── disconnect-banner.tsx     # Persistent disconnect warning
lib/
├── uazapi/
│   ├── index.ts                  # Re-exports
│   ├── types.ts                  # TypeScript types
│   └── service.ts                # UAZAPI client service
└── hooks/
    └── use-polling.ts            # Reusable polling hook
```

### Pattern 1: UAZAPI Service Layer
**What:** Singleton service class that proxies all UAZAPI calls through Next.js API routes
**When to use:** All WhatsApp instance operations
**Example:**
```typescript
// Source: Original project lib/uazapi/service.ts
export class UAZAPIService {
  private baseUrl = '/api/uazapi'

  async obterStatus(instanceToken: string): Promise<UAZAPIStatusResponse> {
    const response = await fetch(`${this.baseUrl}/instances/${instanceToken}/status`)
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`)
    return response.json()
  }
}

// Singleton pattern
let serviceInstance: UAZAPIService | null = null
export function getUAZAPIService(): UAZAPIService {
  if (!serviceInstance) serviceInstance = new UAZAPIService()
  return serviceInstance
}
```

### Pattern 2: Polling with useEffect
**What:** Client-side polling with cleanup and pause-on-invisible
**When to use:** Status checking every 30 seconds
**Example:**
```typescript
// Source: Best practices for React polling
const POLLING_INTERVAL = 30000

useEffect(() => {
  if (status !== 'waiting') return

  const interval = setInterval(checkStatus, POLLING_INTERVAL)
  return () => clearInterval(interval)
}, [status, checkStatus])
```

### Pattern 3: Card-Based Instance Display
**What:** Each instance displayed as a Card with Badge status, Collapsible history
**When to use:** Instance list page
**Example:**
```typescript
// Using existing shadcn components
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>{instance.nome_instancia}</CardTitle>
      <Badge variant={isConnected ? "default" : "secondary"}>
        {isConnected ? "Conectado" : "Desconectado"}
      </Badge>
    </div>
  </CardHeader>
  <CardContent>
    {/* Instance info */}
  </CardContent>
  <Collapsible>
    <CollapsibleTrigger>Ver historico</CollapsibleTrigger>
    <CollapsibleContent>
      {/* Last 5 events */}
    </CollapsibleContent>
  </Collapsible>
</Card>
```

### Pattern 4: MCP Discovery Endpoint
**What:** REST endpoint that lists available MCP tools with authentication
**When to use:** `/api/mcp` discovery endpoint
**Example:**
```typescript
// Source: MCP Protocol specification
// GET /api/mcp - List available tools
export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')
  if (!apiKey || !isValidApiKey(apiKey)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    tools: [
      {
        name: 'get_instance_status',
        description: 'Obtem status da instancia WhatsApp',
        parameters: { instance_id: 'string' }
      },
      {
        name: 'configure_webhook',
        description: 'Configura webhook N8N para instancia',
        parameters: { instance_id: 'string' }
      }
    ]
  })
}
```

### Anti-Patterns to Avoid
- **Direct UAZAPI calls from client:** Always proxy through Next.js API routes for security
- **Storing token in localStorage:** Token is managed server-side (SaaS model)
- **Infinite polling without cleanup:** Always cleanup intervals on unmount
- **Hardcoded webhook URLs:** Use environment variables (`WEBHOOK_N8N_URL`)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Phone number formatting | Custom regex | Original project's `formatPhoneNumber()` | Handles BR formats, edge cases |
| JID extraction | Manual parsing | Original project's `extractPhoneFromJID()` | Handles object and string JIDs |
| QR code display | Custom component | Next.js Image with base64 src | UAZAPI returns base64 directly |
| Modal overlay | Custom positioning | Sheet or Drawer components | Already handles accessibility, animation |
| Confirmation dialog | Custom modal | AlertDialog component | Already in project, handles focus trap |
| Status badges | Custom styling | Badge component with variants | Consistent with design system |

**Key insight:** The original project (`sincron-grupos`) has battle-tested solutions for UAZAPI integration. Port the logic, rebuild the UI.

## Common Pitfalls

### Pitfall 1: QR Code Expiration Handling
**What goes wrong:** QR code expires (2 minutes) and UI shows stale code
**Why it happens:** UAZAPI generates new QR codes on each `/instance/connect` call
**How to avoid:**
- Track QR code age with countdown timer
- Auto-regenerate when expired (per CONTEXT.md: "QR expirado: regenera automaticamente")
- Show visual countdown to user
**Warning signs:** Users report "QR code doesn't work" but refresh fixes it

### Pitfall 2: Status Sync Inconsistency
**What goes wrong:** Database says "conectado" but UAZAPI says "desconectado"
**Why it happens:** Connection lost without webhook notification
**How to avoid:**
- Always verify status with UAZAPI on page load (not just database)
- Update database when status mismatch detected
- Original project pattern: check UAZAPI, update Supabase if different
**Warning signs:** Card shows "connected" badge but actions fail

### Pitfall 3: Polling Memory Leaks
**What goes wrong:** Multiple polling intervals running, performance degrades
**Why it happens:** useEffect cleanup not properly implemented
**How to avoid:**
- Always return cleanup function from useEffect
- Use refs for callback to avoid stale closures
- Consider visibility API to pause when tab not visible
**Warning signs:** Console shows duplicate requests, incrementing interval count

### Pitfall 4: Webhook Configuration Race Condition
**What goes wrong:** Webhook configured before connection fully established
**Why it happens:** Calling webhook config immediately after QR scanned
**How to avoid:**
- Only configure webhook after status shows connected AND loggedIn
- Original project pattern: check `extracted.connected && extracted.loggedIn`
- Add error handling for webhook config failure (non-blocking)
**Warning signs:** Webhook endpoint not receiving events despite "success" message

### Pitfall 5: Modal QR Code Positioning
**What goes wrong:** QR code modal obscures important information
**Why it happens:** Modal covers entire screen on mobile
**How to avoid:**
- Use Sheet component with proper sizing
- On mobile, use Drawer from bottom
- Keep modal content focused (QR + instructions only)
**Warning signs:** Users can't see connection status change while modal open

## Code Examples

Verified patterns from original project and official sources:

### Instance Status Response Processing
```typescript
// Source: Original project app/api/uazapi/instances/[token]/status/route.ts
const enrichedData = {
  ...data,
  phoneNumber,
  phoneFormatted,
  extractedStatus: {
    connected: data.status?.connected ?? false,
    loggedIn: data.status?.loggedIn ?? false,
    phoneNumber,
    phoneFormatted,
    profileName: data.instance?.profileName || null,
    profilePicUrl: data.instance?.profilePicUrl || null,
    isBusiness: data.instance?.isBusiness ?? false,
    platform: data.instance?.plataform || null,
    lastDisconnect: data.instance?.lastDisconnect || null,
    lastDisconnectReason: data.instance?.lastDisconnectReason || null,
  }
}
```

### Webhook Configuration
```typescript
// Source: Original project app/api/uazapi/instances/[token]/webhook/route.ts
const webhookConfig = {
  enabled: true,
  url: WEBHOOK_URL,  // From ENV, not client
  events: ['messages', 'connection', 'groups'],
  excludeMessages: ['wasSentByApi'],  // Prevent loops
  addUrlEvents: true  // Organizes events in endpoint paths
}
```

### Toast Notifications Pattern
```typescript
// Source: Current project lib/toast.ts
import { showSuccess, showError } from '@/lib/toast'

// Success (3s duration)
showSuccess('Instancia conectada com sucesso!')

// Error (7s duration)
showError('Falha ao conectar. Tente novamente.')
```

### Connection Status Check with Auto-Webhook
```typescript
// Source: Original project app/(dashboard)/instances/page.tsx
if (newStatus === "conectado" && !instancia.webhook_url) {
  try {
    const webhookResponse = await fetch(`/api/uazapi/instances/${instancia.api_key}/webhook`, {
      method: 'POST'
    })
    if (webhookResponse.ok) {
      console.log(`Webhook configurado automaticamente para instancia`)
    }
  } catch (webhookErr) {
    console.error('Erro ao configurar webhook:', webhookErr)
    // Non-blocking - don't fail connection flow
  }
}
```

### MCP Tool Definition Pattern
```typescript
// Source: MCP Protocol specification (modelcontextprotocol.io)
interface MCPTool {
  name: string
  description: string
  inputSchema: {
    type: 'object'
    properties: Record<string, { type: string; description: string }>
    required?: string[]
  }
}

const tools: MCPTool[] = [
  {
    name: 'get_instance_status',
    description: 'Obtem status atual da instancia WhatsApp',
    inputSchema: {
      type: 'object',
      properties: {
        instance_id: { type: 'string', description: 'ID da instancia' }
      },
      required: ['instance_id']
    }
  }
]
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Table-based instance list | Card-based layout | Phase 4 decision | Better mobile UX, more info per item |
| Token visible to user | Token hidden (SaaS) | Phase 4 decision | Simplified UX, security |
| Manual webhook config | Auto-config on connect | Original project | Zero-config for user |
| Separate history page | Collapsible in card | Phase 4 decision | Faster access to recent events |

**Deprecated/outdated:**
- Direct UAZAPI calls from browser: Replaced by proxied API routes (CORS, security)
- Manual QR regeneration: Auto-regenerate on expiration

## Open Questions

Things that couldn't be fully resolved:

1. **Connection History Table Schema**
   - What we know: Need to store last 5 connection events per instance
   - What's unclear: Does `instancias_whatsapp` table already have history fields, or need new table?
   - Recommendation: Check Supabase schema; if no history table exists, create `historico_conexoes` table

2. **Instance Limits by Billing Plan**
   - What we know: CONTEXT.md mentions "Limite de instancias definido pelo plano de billing"
   - What's unclear: Where are plan limits stored? How to check current count vs limit?
   - Recommendation: Check `organizacoes` table or billing schema for limits

3. **N8N Webhook URL Configuration**
   - What we know: Original project uses `WEBHOOK_N8N_URL` env variable
   - What's unclear: Is this URL already configured in the new project's ENV?
   - Recommendation: Verify ENV setup before implementing webhook configuration

4. **MCP API Key Generation**
   - What we know: MCP endpoint requires `x-api-key` header authentication
   - What's unclear: How are API keys generated and stored? Per organization? Per user?
   - Recommendation: Define API key strategy during planning; likely stored in `organizacoes` table

## Sources

### Primary (HIGH confidence)
- Original project `C:\Users\Pichau\Desktop\Projetos\Sincron\sincron-grupos` - Full UAZAPI implementation
- `uazapi-openapi-spec.yaml` - Official UAZAPI endpoint documentation
- Current project codebase - Existing components, patterns, and structure

### Secondary (MEDIUM confidence)
- [MCP Architecture Overview](https://modelcontextprotocol.io/docs/learn/architecture) - Tools discovery pattern
- [React Polling Best Practices](https://www.davegray.codes/posts/usepolling-custom-hook-for-auto-fetching-in-nextjs) - usePolling hook patterns

### Tertiary (LOW confidence)
- None required - all critical information available from primary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project
- Architecture: HIGH - Original project provides working patterns
- Pitfalls: HIGH - Original project demonstrates solutions
- MCP: MEDIUM - Protocol is well-documented but implementation is new

**Research date:** 2026-01-29
**Valid until:** 2026-02-28 (30 days - stable domain)
