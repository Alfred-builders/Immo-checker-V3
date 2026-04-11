import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api-client'

interface User {
  id: string
  email: string
  nom: string
  prenom: string
}

interface Workspace {
  id: string
  nom: string
  type_workspace: string
  logo_url: string | null
  couleur_primaire: string | null
  role: string
}

interface AuthState {
  user: User | null
  workspace: Workspace | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<LoginResult>
  logout: () => Promise<void>
  switchWorkspace: (workspaceId: string, userId?: string) => Promise<void>
  refreshWorkspace: () => Promise<void>
}

interface LoginResult {
  requireWorkspaceSelect: boolean
  workspaces?: Workspace[]
  user: User
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    workspace: null,
    isLoading: true,
    isAuthenticated: false,
  })
  const queryClient = useQueryClient()

  // Check auth on mount — skipAuthRedirect to avoid infinite reload loop
  useEffect(() => {
    api<{ id: string; email: string; nom: string; prenom: string; workspace: Workspace; role: string }>(
      '/auth/me',
      { skipAuthRedirect: true }
    )
      .then((data) => {
        setState({
          user: { id: data.id, email: data.email, nom: data.nom, prenom: data.prenom },
          workspace: data.workspace,
          isLoading: false,
          isAuthenticated: true,
        })
      })
      .catch(() => {
        setState({ user: null, workspace: null, isLoading: false, isAuthenticated: false })
      })
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    const result = await api<{
      user: User
      workspace?: Workspace
      workspaces?: Workspace[]
      requireWorkspaceSelect: boolean
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    if (!result.requireWorkspaceSelect && result.workspace) {
      setState({
        user: result.user,
        workspace: result.workspace,
        isLoading: false,
        isAuthenticated: true,
      })
    }

    return {
      requireWorkspaceSelect: result.requireWorkspaceSelect,
      workspaces: result.workspaces,
      user: result.user,
    }
  }, [])

  const switchWorkspace = useCallback(async (workspaceId: string, userId?: string) => {
    await api('/auth/switch-workspace', {
      method: 'POST',
      body: JSON.stringify({ workspaceId, userId }),
    })

    // Reload user info with new workspace
    const data = await api<{ id: string; email: string; nom: string; prenom: string; workspace: Workspace; role: string }>('/auth/me')

    queryClient.clear()

    setState({
      user: { id: data.id, email: data.email, nom: data.nom, prenom: data.prenom },
      workspace: data.workspace,
      isLoading: false,
      isAuthenticated: true,
    })
  }, [queryClient])

  const refreshWorkspace = useCallback(async () => {
    const data = await api<{ id: string; email: string; nom: string; prenom: string; workspace: Workspace; role: string }>('/auth/me')
    setState({
      user: { id: data.id, email: data.email, nom: data.nom, prenom: data.prenom },
      workspace: data.workspace,
      isLoading: false,
      isAuthenticated: true,
    })
  }, [])

  const logout = useCallback(async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => {})
    queryClient.clear()
    setState({ user: null, workspace: null, isLoading: false, isAuthenticated: false })
  }, [queryClient])

  return (
    <AuthContext.Provider value={{ ...state, login, logout, switchWorkspace, refreshWorkspace }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
