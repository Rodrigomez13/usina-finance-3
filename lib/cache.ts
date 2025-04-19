// Sistema de caché para reducir llamadas a la API

interface CacheItem<T> {
    data: T
    timestamp: number
    expiry: number
  }
  
  class ApiCache {
    private cache: Record<string, CacheItem<any>> = {}
    private static instance: ApiCache
  
    // Tiempo de expiración predeterminado: 30 minutos
    private defaultExpiry = 30 * 60 * 1000
  
    private constructor() {}
  
    public static getInstance(): ApiCache {
      if (!ApiCache.instance) {
        ApiCache.instance = new ApiCache()
      }
      return ApiCache.instance
    }
  
    // Obtener datos de la caché o de la API
    public async get<T>(
      key: string,
      fetchFunction: () => Promise<T>,
      options: { expiry?: number; forceRefresh?: boolean } = {},
    ): Promise<T> {
      const now = Date.now()
      const expiry = options.expiry || this.defaultExpiry
      const forceRefresh = options.forceRefresh || false
  
      // Si hay datos en caché y no están expirados y no se fuerza la actualización
      if (this.cache[key] && now - this.cache[key].timestamp < this.cache[key].expiry && !forceRefresh) {
        console.log(`Usando datos en caché para: ${key}`)
        return this.cache[key].data
      }
  
      // Si no hay datos en caché o están expirados o se fuerza la actualización
      console.log(`Obteniendo datos frescos para: ${key}`)
      try {
        const data = await fetchFunction()
        this.cache[key] = {
          data,
          timestamp: now,
          expiry,
        }
        return data
      } catch (error) {
        // Si hay un error y tenemos datos en caché, devolvemos los datos en caché aunque estén expirados
        if (this.cache[key]) {
          console.warn(`Error al obtener datos frescos para ${key}, usando caché expirada`)
          return this.cache[key].data
        }
        throw error
      }
    }
  
    // Invalidar un elemento específico de la caché
    public invalidate(key: string): void {
      delete this.cache[key]
    }
  
    // Invalidar toda la caché
    public invalidateAll(): void {
      this.cache = {}
    }
  
    // Invalidar elementos de la caché que coincidan con un patrón
    public invalidatePattern(pattern: RegExp): void {
      Object.keys(this.cache).forEach((key) => {
        if (pattern.test(key)) {
          delete this.cache[key]
        }
      })
    }
  }
  
  export const apiCache = ApiCache.getInstance()
  