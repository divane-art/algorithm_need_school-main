/**
 * Client HTTP pour l'API REST AlgoPlanR (/api/v1/).
 *
 * Implémente le contrat d'échange avec le backend Django.
 * Conçu pour fonctionner de manière résiliente : si le serveur Django
 * n'est pas encore lancé (développement en cours), le client signale
 * la non-disponibilité afin que les adaptateurs locaux prennent le relais.
 */

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string,
    public details?: unknown,
  ) {
    super(message)
    this.name = 'ApiClientError'
  }
}

export interface ApiClientConfig {
  baseUrl?: string
  jeton?: string
}

export class ApiClient {
  private baseUrl: string
  private jeton?: string

  constructor(config: ApiClientConfig = {}) {
    const defaultUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'
    this.baseUrl = config.baseUrl || defaultUrl
    this.jeton = config.jeton
  }

  setJeton(jeton: string | undefined) {
    this.jeton = jeton
  }

  private headers(customHeaders?: HeadersInit): HeadersInit {
    const h: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }
    if (this.jeton) {
      h['X-AlgoPlanR-Jeton'] = this.jeton
    }
    if (customHeaders) {
      Object.assign(h, customHeaders)
    }
    return h
  }

  private url(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    const cleanBase = this.baseUrl.replace(/\/+$/, '')
    return `${cleanBase}${cleanEndpoint}`
  }

  async checkSante(): Promise<boolean> {
    try {
      const res = await fetch(this.url('/sante/'), {
        method: 'GET',
        headers: this.headers(),
      })
      return res.ok
    } catch {
      return false
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | boolean | null | undefined>): Promise<T> {
    let target = this.url(endpoint)
    if (params) {
      const sp = new URLSearchParams()
      for (const [key, value] of Object.entries(params)) {
        if (value !== null && value !== undefined && value !== '') {
          sp.append(key, String(value))
        }
      }
      const qs = sp.toString()
      if (qs) target += `?${qs}`
    }

    const res = await fetch(target, {
      method: 'GET',
      headers: this.headers(),
    })

    if (!res.ok) {
      let details: unknown
      try {
        details = await res.json()
      } catch {
        // no body
      }
      throw new ApiClientError(res.status, res.statusText, `Échec GET ${endpoint} (${res.status})`, details)
    }

    return res.json() as Promise<T>
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
    const headers = isFormData
      ? this.jeton
        ? { 'X-AlgoPlanR-Jeton': this.jeton }
        : {}
      : this.headers()

    const res = await fetch(this.url(endpoint), {
      method: 'POST',
      headers,
      body: isFormData ? (body as FormData) : JSON.stringify(body ?? {}),
    })

    if (!res.ok) {
      let details: unknown
      try {
        details = await res.json()
      } catch {
        // no body
      }
      throw new ApiClientError(res.status, res.statusText, `Échec POST ${endpoint} (${res.status})`, details)
    }

    return res.json() as Promise<T>
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    const res = await fetch(this.url(endpoint), {
      method: 'PUT',
      headers: this.headers(),
      body: JSON.stringify(body ?? {}),
    })

    if (!res.ok) {
      let details: unknown
      try {
        details = await res.json()
      } catch {
        // no body
      }
      throw new ApiClientError(res.status, res.statusText, `Échec PUT ${endpoint} (${res.status})`, details)
    }

    return res.json() as Promise<T>
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    const res = await fetch(this.url(endpoint), {
      method: 'PATCH',
      headers: this.headers(),
      body: JSON.stringify(body ?? {}),
    })

    if (!res.ok) {
      let details: unknown
      try {
        details = await res.json()
      } catch {
        // no body
      }
      throw new ApiClientError(res.status, res.statusText, `Échec PATCH ${endpoint} (${res.status})`, details)
    }

    return res.json() as Promise<T>
  }

  async delete<T = void>(endpoint: string): Promise<T> {
    const res = await fetch(this.url(endpoint), {
      method: 'DELETE',
      headers: this.headers(),
    })

    if (!res.ok) {
      let details: unknown
      try {
        details = await res.json()
      } catch {
        // no body
      }
      throw new ApiClientError(res.status, res.statusText, `Échec DELETE ${endpoint} (${res.status})`, details)
    }

    try {
      return (await res.json()) as T
    } catch {
      return undefined as unknown as T
    }
  }
}

export const apiClient = new ApiClient()
