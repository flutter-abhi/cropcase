# 🚀 Crop Case API Reference Guide

## Quick Reference

### Base URL
```
http://localhost:3000/api/cases
```

### Authentication
```javascript
const userId = "dummy-user-123"; // Static user ID
```

---

## 📋 **API Endpoints Quick Reference**

### 1. **My Cases API**
```http
GET /api/cases/my-cases?userId={userId}&page={page}&limit={limit}&sortBy={field}&sortOrder={order}
```

**Parameters:**
- `userId` (required): User ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)
- `sortBy` (optional): `createdAt`, `name`, `totalLand`, `likes` (default: `createdAt`)
- `sortOrder` (optional): `asc`, `desc` (default: `desc`)

**Response:**
```json
{
  "cases": [...],
  "stats": {
    "totalCases": 3,
    "totalLand": 23,
    "averageLandPerCase": 7.67
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### 2. **Community Cases API**
```http
GET /api/cases/community?userId={userId}&page={page}&limit={limit}&sortBy={field}&sortOrder={order}
```

**Parameters:** Same as My Cases API

**Response:**
```json
{
  "cases": [...],
  "stats": {
    "totalCommunityCases": 3,
    "totalFarmers": 3,
    "totalLikes": 0,
    "averageLikesPerCase": 0
  },
  "pagination": { ... }
}
```

### 3. **Search API**
```http
GET /api/cases/search?userId={userId}&q={query}&page={page}&limit={limit}&sortBy={field}&sortOrder={order}
```

**Parameters:**
- All My Cases parameters, plus:
- `q` (optional): Search query (name, description, tags)
- `minLand` (optional): Minimum land size
- `maxLand` (optional): Maximum land size

**Response:**
```json
{
  "cases": [...],
  "filters": {
    "appliedFilters": { ... },
    "availableSeasons": ["Spring", "Summer", "Fall", "Winter"],
    "availableTags": ["organic", "sustainable", "wheat"]
  },
  "pagination": { ... }
}
```

### 4. **Legacy Cases API**
```http
GET /api/cases
GET /api/cases?page={page}&limit={limit}&userId={userId}
```

**Response (Legacy):**
```json
[
  { "id": "...", "name": "...", ... }
]
```

**Response (Paginated):**
```json
{
  "data": [...],
  "pagination": { ... }
}
```

### 5. **Create Case API**
```http
POST /api/cases
```

**Request Body:**
```json
{
  "name": "New Farm Case",
  "description": "Description",
  "totalLand": 25,
  "location": "California, USA",
  "isPublic": true,
  "tags": ["wheat", "sustainable"],
  "userId": "dummy-user-123",
  "crops": [
    {
      "cropId": "crop-123",
      "weight": 60,
      "notes": "High yield variety"
    }
  ]
}
```

---

## 🔧 **Error Codes Reference**

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `MISSING_USER_ID` | 400 | User ID parameter required |
| `INVALID_PAGINATION` | 400 | Invalid page/limit values |
| `INTERNAL_ERROR` | 500 | Server error |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `NOT_FOUND` | 404 | Resource not found |

---

## 📊 **Response Data Types**

### Case Object
```typescript
interface Case {
  id: string;
  name: string;
  description: string | null;
  totalLand: number;
  location: string | null;
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  crops: Array<{
    name: string;
    weight: number;
    season: string;
    notes: string | null;
  }>;
  likes: number;
  views: number;
}
```

### Pagination Object
```typescript
interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
```

### Stats Object
```typescript
interface MyCasesStats {
  totalCases: number;
  totalLand: number;
  averageLandPerCase: number;
}

interface CommunityStats {
  totalCommunityCases: number;
  totalFarmers: number;
  totalLikes: number;
  averageLikesPerCase: number;
}
```

---

## 🚀 **Quick Start Examples**

### Fetch User's Cases
```javascript
const fetchMyCases = async (userId, page = 1) => {
  const response = await fetch(
    `/api/cases/my-cases?userId=${userId}&page=${page}&limit=10`
  );
  return response.json();
};
```

### Fetch Community Cases
```javascript
const fetchCommunityCases = async (userId, page = 1) => {
  const response = await fetch(
    `/api/cases/community?userId=${userId}&page=${page}&limit=10`
  );
  return response.json();
};
```

### Search Cases
```javascript
const searchCases = async (userId, query, page = 1) => {
  const response = await fetch(
    `/api/cases/search?userId=${userId}&q=${query}&page=${page}&limit=10`
  );
  return response.json();
};
```

### Create New Case
```javascript
const createCase = async (caseData) => {
  const response = await fetch('/api/cases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(caseData)
  });
  return response.json();
};
```

---

## 🎯 **Common Use Cases**

### 1. **Load User's Cases with Pagination**
```javascript
const { cases, stats, pagination } = await fetchMyCases('dummy-user-123', 1);
console.log(`Found ${stats.totalCases} cases, ${stats.totalLand} acres total`);
```

### 2. **Load More Cases (Infinite Scroll)**
```javascript
const loadMoreCases = async (currentPage) => {
  const { cases, pagination } = await fetchMyCases('dummy-user-123', currentPage + 1);
  return { cases, hasMore: pagination.hasNext };
};
```

### 3. **Search with Filters**
```javascript
const searchResults = await searchCases('dummy-user-123', 'wheat');
const filteredResults = searchResults.cases.filter(c => c.totalLand > 10);
```

### 4. **Sort Cases**
```javascript
const sortedCases = await fetchMyCases('dummy-user-123', 1, 10, 'name', 'asc');
```

---

## ⚡ **Performance Tips**

1. **Use appropriate limits**: Don't fetch more than 50 items per page
2. **Cache responses**: Store frequently accessed data
3. **Implement pagination**: Load data progressively
4. **Use specific endpoints**: My Cases vs Community Cases
5. **Handle errors**: Implement proper error handling

---

## 🔍 **Testing Commands**

```bash
# Test My Cases API
curl "http://localhost:3000/api/cases/my-cases?userId=dummy-user-123&page=1&limit=5"

# Test Community Cases API
curl "http://localhost:3000/api/cases/community?userId=dummy-user-123&page=1&limit=5"

# Test Search API
curl "http://localhost:3000/api/cases/search?userId=dummy-user-123&q=case&page=1&limit=5"

# Test Legacy API
curl "http://localhost:3000/api/cases"
```

---

This reference guide provides quick access to all API endpoints, parameters, and examples for efficient development.
