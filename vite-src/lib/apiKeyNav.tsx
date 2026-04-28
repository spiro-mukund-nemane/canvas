// src/lib/apiKeyNav.tsx
import { Link, useNavigate, useSearch} from '@tanstack/react-router'
import type { LinkProps, NavigateOptions } from '@tanstack/react-router'

type ApiKeyLinkProps = Omit<LinkProps, 'search'> & {
  search?: Record<string, unknown>
}

type ApiKeySearch = { key?: string }

export function ApiKeyLink({ to, search = {}, ...props }: ApiKeyLinkProps) {
  const currentSearch = useSearch({ strict: false }) as ApiKeySearch // ✅ Correct usage

  const preservedSearch = {
    ...search,
    key: currentSearch?.key,
  }

  return <Link to={to} search={preservedSearch} {...props} />
}


export function useApiKeyNavigate() {
  const navigate = useNavigate()
  const currentSearch = useSearch({ strict: false }) // ✅ Provide opts

  return (opts: NavigateOptions) => {
    const newSearch = {
      ...(currentSearch as object), // Type-safe workaround
      ...(opts.search || {}),
    }

    return navigate({
      ...opts,
      search: newSearch,
    })
  }
}