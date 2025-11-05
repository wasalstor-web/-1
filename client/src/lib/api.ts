import type { 
  Project, 
  InsertProject, 
  Conversation, 
  InsertConversation,
  Product,
  Category,
  Order,
  InsertOrder,
  OrderItem,
  InsertOrderItem
} from "@shared/schema";

const API_BASE = '/api';

// Project API
export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    const response = await fetch(`${API_BASE}/projects`);
    if (!response.ok) throw new Error('Failed to fetch projects');
    return response.json();
  },

  getById: async (id: string): Promise<Project> => {
    const response = await fetch(`${API_BASE}/projects/${id}`);
    if (!response.ok) throw new Error('Failed to fetch project');
    return response.json();
  },

  create: async (project: InsertProject): Promise<Project> => {
    const response = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
    if (!response.ok) throw new Error('Failed to create project');
    return response.json();
  },

  update: async (id: string, updates: Partial<InsertProject>): Promise<Project> => {
    const response = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update project');
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete project');
  },
};

// Conversation API
export const conversationsApi = {
  getByProject: async (projectId: string): Promise<Conversation[]> => {
    const response = await fetch(`${API_BASE}/projects/${projectId}/conversations`);
    if (!response.ok) throw new Error('Failed to fetch conversations');
    return response.json();
  },

  create: async (conversation: InsertConversation): Promise<Conversation> => {
    const response = await fetch(`${API_BASE}/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(conversation),
    });
    if (!response.ok) throw new Error('Failed to create conversation');
    return response.json();
  },
};

// AI Chat API with streaming
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  model: 'gpt-4' | 'claude' | 'gemini';
  messages: ChatMessage[];
  temperature?: number;
}

export const chatApi = {
  stream: async (
    request: ChatRequest,
    onChunk: (content: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to start chat');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          onComplete();
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              onComplete();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                onChunk(parsed.content);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      onError(error as Error);
    }
  },
};

// Product API
export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    const response = await fetch(`${API_BASE}/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  getFeatured: async (): Promise<Product[]> => {
    const response = await fetch(`${API_BASE}/products?featured=true`);
    if (!response.ok) throw new Error('Failed to fetch featured products');
    return response.json();
  },

  getByCategory: async (categorySlug: string): Promise<Product[]> => {
    const response = await fetch(`${API_BASE}/products?category=${categorySlug}`);
    if (!response.ok) throw new Error('Failed to fetch products by category');
    return response.json();
  },

  getBySlug: async (slug: string): Promise<Product> => {
    const response = await fetch(`${API_BASE}/products/${slug}`);
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json();
  },
};

// Category API
export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await fetch(`${API_BASE}/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  getBySlug: async (slug: string): Promise<Category> => {
    const response = await fetch(`${API_BASE}/categories/${slug}`);
    if (!response.ok) throw new Error('Failed to fetch category');
    return response.json();
  },
};

// Order API
export const ordersApi = {
  getByUser: async (userId: string): Promise<Order[]> => {
    const response = await fetch(`${API_BASE}/orders/user/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  },

  getById: async (id: string): Promise<Order> => {
    const response = await fetch(`${API_BASE}/orders/${id}`);
    if (!response.ok) throw new Error('Failed to fetch order');
    return response.json();
  },

  create: async (order: InsertOrder): Promise<Order> => {
    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!response.ok) throw new Error('Failed to create order');
    return response.json();
  },

  getItems: async (orderId: string): Promise<OrderItem[]> => {
    const response = await fetch(`${API_BASE}/orders/${orderId}/items`);
    if (!response.ok) throw new Error('Failed to fetch order items');
    return response.json();
  },

  addItem: async (orderId: string, item: Omit<InsertOrderItem, 'orderId'>): Promise<OrderItem> => {
    const response = await fetch(`${API_BASE}/orders/${orderId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!response.ok) throw new Error('Failed to add order item');
    return response.json();
  },
};

// Export utility
export const exportApi = {
  exportProject: (project: Project, conversations: Conversation[]) => {
    const data = {
      project,
      conversations,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  exportConversation: (conversation: Conversation) => {
    const messages = JSON.parse(conversation.messages);
    const text = messages.map((m: ChatMessage) => 
      `${m.role === 'user' ? 'المستخدم' : 'المساعد'}: ${m.content}`
    ).join('\n\n');
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
