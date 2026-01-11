# 👨‍💻 Bobby's Workshop - Developer Guide

## Architecture Overview

Bobby's Workshop uses a **hybrid stack**:
- **Frontend**: React + TypeScript + Tailwind CSS (Vite)
- **Backend**: Node.js/Express (device management) + Python/FastAPI (audio processing)
- **State Management**: Zustand
- **Authentication**: Phoenix Key (custom)

---

## Project Structure

```
Bobbys-Workshop--3.0.0/
├── backend/                 # Python FastAPI backend
│   ├── main.py              # FastAPI app entry
│   ├── modules/
│   │   ├── sonic/           # Audio forensic intelligence
│   │   ├── ghost/           # Stealth operations
│   │   ├── pandora/        # Hardware manipulation
│   │   └── auth/           # Phoenix Key authentication
│   └── requirements.txt    # Python dependencies
│
├── server/                  # Node.js Express backend
│   └── routes/
│       └── v1/
│           └── trapdoor/    # Secret Rooms API
│
├── src/                     # React frontend
│   ├── components/
│   │   ├── sonic/          # Sonic Codex components
│   │   ├── ghost/          # Ghost Codex components
│   │   ├── pandora/        # Pandora Codex components
│   │   ├── trapdoor/       # Secret Rooms UI
│   │   └── auth/           # Authentication UI
│   ├── stores/             # Zustand stores
│   └── lib/                # Utilities
│
└── tests/                   # Test suite
    ├── backend/            # Python tests
    └── e2e/                # Playwright tests
```

---

## Adding a New Secret Room

### Step 1: Backend Module

Create module in `backend/modules/`:

```python
# backend/modules/newroom/__init__.py
# New Room Module

# backend/modules/newroom/routes.py
from fastapi import APIRouter
router = APIRouter()

@router.get("/status")
async def get_status():
    return {"status": "ready"}
```

### Step 2: Register Router

Add to `backend/main.py`:

```python
from backend.modules.newroom.routes import router as newroom_router

app.include_router(
    newroom_router,
    prefix="/api/v1/trapdoor/newroom",
    tags=["New Room"]
)
```

### Step 3: Frontend Component

Create component in `src/components/newroom/`:

```typescript
// src/components/newroom/NewRoomDashboard.tsx
export function NewRoomDashboard() {
  return <div>New Room Content</div>;
}
```

### Step 4: Add to Navigation

Update `src/components/trapdoor/TrapdoorRoomNavigation.tsx`:

```typescript
export type SecretRoomId = 
  | 'sonic-codex'
  | 'ghost-codex'
  | 'new-room';  // Add here

const SECRET_ROOMS = [
  // ... existing rooms
  {
    id: 'new-room',
    label: 'New Room',
    icon: <Icon className="w-5 h-5" />,
    description: 'Room description',
    danger: false,
  },
];
```

### Step 5: Add Routing

Update `src/components/screens/WorkbenchSecretRooms.tsx`:

```typescript
import { NewRoomDashboard } from '../newroom/NewRoomDashboard';

// In render:
{activeRoom === 'new-room' && (
  <NewRoomDashboard />
)}
```

---

## State Management Pattern

### Creating a Store

```typescript
// src/stores/myStore.ts
import { create } from 'zustand';

interface MyState {
  data: string[];
  setData: (data: string[]) => void;
}

export const useMyStore = create<MyState>((set) => ({
  data: [],
  setData: (data) => set({ data }),
}));
```

### Using in Components

```typescript
import { useMyStore } from '@/stores/myStore';

export function MyComponent() {
  const { data, setData } = useMyStore();
  // Use data and setData
}
```

---

## API Integration Pattern

### Making Authenticated Requests

```typescript
import { useAuthStore } from '@/stores/authStore';

const { token } = useAuthStore();

const response = await fetch('/api/v1/trapdoor/sonic/jobs', {
  headers: {
    'X-Secret-Room-Passcode': token || ''
  }
});
```

### Error Handling

```typescript
try {
  const response = await fetch(url, options);
  if (!response.ok) {
    if (response.status === 401) {
      // Token expired, redirect to auth
      useAuthStore.getState().clearAuth();
    }
    throw new Error(`API error: ${response.statusText}`);
  }
  return await response.json();
} catch (error) {
  console.error('Request failed:', error);
  throw error;
}
```

---

## Testing Patterns

### Unit Test Example

```python
# tests/backend/unit/test_my_module.py
def test_my_function():
    result = my_function("input")
    assert result == "expected"
```

### Integration Test Example

```python
# tests/backend/integration/test_my_pipeline.py
def test_full_pipeline():
    # Setup
    input_data = create_test_data()
    
    # Execute
    result = process_pipeline(input_data)
    
    # Verify
    assert result.status == "complete"
```

### E2E Test Example

```typescript
// tests/e2e/my-feature.spec.ts
test('user workflow', async ({ page }) => {
  await page.goto('/');
  await page.click('button');
  await expect(page.locator('.result')).toBeVisible();
});
```

---

## Performance Optimization

### Caching

Use the performance module for caching:

```python
from backend.modules.sonic.performance import cache_job_list, get_cached_job_list

# Cache
cache_job_list(jobs, ttl=60)

# Retrieve
cached = get_cached_job_list()
if cached:
    return cached
```

### Background Jobs

For long-running tasks, use background processing:

```python
from fastapi import BackgroundTasks

@router.post("/process")
async def process_job(
    job_id: str,
    background_tasks: BackgroundTasks
):
    background_tasks.add_task(long_running_task, job_id)
    return {"status": "processing"}
```

---

## Code Style

### Python
- Follow PEP 8
- Use type hints
- Docstrings for all functions
- Maximum line length: 100

### TypeScript
- Use TypeScript strict mode
- Prefer functional components
- Use hooks for state
- Maximum line length: 100

---

## Debugging

### Backend Logging

```python
import logging
logger = logging.getLogger(__name__)

logger.info("Processing job")
logger.error("Error occurred", exc_info=True)
```

### Frontend Logging

```typescript
console.log('[Component] Action:', data);
console.error('[Component] Error:', error);
```

---

## Deployment

### Environment Variables

```bash
# Backend
PYTHON_BACKEND_PORT=8000
SECRET_SEQUENCE=your-secret-sequence

# Frontend
VITE_API_URL=http://localhost:8000
```

### Docker (Optional)

```dockerfile
FROM python:3.11
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0"]
```

---

## Contributing

1. Create feature branch
2. Write tests
3. Implement feature
4. Update documentation
5. Submit PR

---

**Questions?** Check the codebase or ask in discussions.
