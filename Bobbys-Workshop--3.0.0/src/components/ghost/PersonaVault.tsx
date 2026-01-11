/**
 * Ghost Codex - Persona Vault
 * Manage burner identities (temp emails, virtual numbers)
 */

import React, { useState, useEffect } from 'react';
import { Shield, Mail, Phone, Plus, Trash2, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { API_CONFIG, apiRequest } from '@/lib/api-client';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface Persona {
  id: string;
  email?: string;
  phone?: string;
  created: string;
  expires: string;
  status: 'active' | 'expired';
}

export function PersonaVault() {
  const { token } = useAuthStore();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (token) {
      loadPersonas();
    }
  }, [token]);

  const loadPersonas = async () => {
    if (!token) {
      setPersonas([]);
      return;
    }
    
    try {
      const response = await apiRequest<{ personas: Persona[] }>(
        API_CONFIG.ENDPOINTS.GHOST_PERSONA_LIST,
        {
          method: 'GET',
          requireAuth: true,
          showErrorToast: false,
        }
      );
      
      if (response.success && response.data) {
        setPersonas(response.data.personas || []);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load personas';
      toast.error(errorMsg);
    }
  };

  const generateEmail = async () => {
    if (!token) {
      toast.error('Please authenticate first with Phoenix Key');
      return;
    }
    
    setIsGenerating(true);
    try {
      const response = await apiRequest<Persona>(
        API_CONFIG.ENDPOINTS.GHOST_PERSONA_GENERATE,
        {
          method: 'POST',
          body: { type: 'email', expires_in_hours: 24 },
          requireAuth: true,
          showErrorToast: true,
        }
      );
      
      if (response.success && response.data) {
        setPersonas(prev => [...prev, response.data!]);
        toast.success('Email persona generated successfully');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to generate email persona';
      toast.error(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePhone = async () => {
    if (!token) {
      toast.error('Please authenticate first with Phoenix Key');
      return;
    }
    
    setIsGenerating(true);
    try {
      const response = await apiRequest<Persona>(
        API_CONFIG.ENDPOINTS.GHOST_PERSONA_GENERATE,
        {
          method: 'POST',
          body: { type: 'phone', expires_in_days: 7 },
          requireAuth: true,
          showErrorToast: true,
        }
      );
      
      if (response.success && response.data) {
        setPersonas(prev => [...prev, response.data!]);
        toast.success('Phone persona generated successfully');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to generate phone persona';
      toast.error(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const deletePersona = async (id: string) => {
    if (!token) {
      toast.error('Please authenticate first with Phoenix Key');
      return;
    }
    
    try {
      const response = await apiRequest(
        `${API_CONFIG.ENDPOINTS.GHOST_PERSONA_LIST}/${id}`,
        {
          method: 'DELETE',
          requireAuth: true,
          showErrorToast: true,
        }
      );
      
      if (response.success) {
        setPersonas(prev => prev.filter(p => p.id !== id));
        toast.success('Persona deleted successfully');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete persona';
      toast.error(errorMsg);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const isExpired = (expires: string) => {
    return new Date(expires) < new Date();
  };

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPersonas().finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="flex flex-col h-full bg-black text-white p-3 sm:p-6 overflow-y-auto">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-purple-400">Persona Vault</h2>
        <p className="text-sm sm:text-base text-gray-400">Manage burner identities</p>
      </div>

      {/* Generate Buttons - Responsive */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
        <button
          onClick={generateEmail}
          disabled={isGenerating || !token}
          className={cn(
            "flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-400 active:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-target-min transition-colors",
            isGenerating && "opacity-75"
          )}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Mail className="w-5 h-5" />
              <span>Generate Email</span>
            </>
          )}
        </button>
        <button
          onClick={generatePhone}
          disabled={isGenerating || !token}
          className={cn(
            "flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-400 active:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-target-min transition-colors",
            isGenerating && "opacity-75"
          )}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Phone className="w-5 h-5" />
              <span>Generate Number</span>
            </>
          )}
        </button>
      </div>

      {/* Personas List - Responsive */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <LoadingSpinner size="lg" text="Loading personas..." />
          </div>
        ) : personas.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Shield className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p>No personas yet. Generate one to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {personas.map((persona) => (
              <div
                key={persona.id}
                className={cn(
                  "p-4 rounded-lg border",
                  isExpired(persona.expires)
                    ? "bg-gray-900/50 border-gray-800 opacity-60"
                    : "bg-gray-900 border-gray-800"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {persona.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-purple-400" />
                          <span className="font-mono text-sm">{persona.email}</span>
                        </div>
                      )}
                      {persona.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-purple-400" />
                          <span className="font-mono text-sm">{persona.phone}</span>
                        </div>
                      )}
                      <span
                        className={cn(
                          "px-2 py-1 rounded text-xs",
                          isExpired(persona.expires)
                            ? "bg-red-500/20 text-red-400"
                            : "bg-green-500/20 text-green-400"
                        )}
                      >
                        {isExpired(persona.expires) ? 'Expired' : 'Active'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Created: {formatDate(persona.created)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Expires: {formatDate(persona.expires)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deletePersona(persona.id)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
