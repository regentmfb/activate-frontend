# Backend Requirements Documentation

## Overview
This document outlines all backend changes required to support the new features implemented in the frontend.

---

## 🆕 1. Lien Management Workflow (Task 1)

### Database Schema

#### LienRequest Table
```sql
CREATE TABLE lien_requests (
  id VARCHAR(255) PRIMARY KEY,
  account_id VARCHAR(255) NOT NULL,
  customer_id VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  reason TEXT NOT NULL,
  supporting_documents JSON,
  status ENUM(
    'PENDING_TEAM_LEAD_REVIEW',
    'PENDING_CMO_REVIEW', 
    'PENDING_OPERATIONS',
    'APPROVED',
    'REJECTED'
  ) NOT NULL DEFAULT 'PENDING_TEAM_LEAD_REVIEW',
  submitted_by_id VARCHAR(255) NOT NULL,
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  review_history JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (account_id) REFERENCES accounts(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (submitted_by_id) REFERENCES staff(id),
  INDEX idx_status (status),
  INDEX idx_submitted_by (submitted_by_id),
  INDEX idx_account (account_id)
);
```

### API Endpoints

#### 1.1 Submit Lien Request
```
POST /activate/liens/request
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "accountId": "acc-123",
  "amount": 50000,
  "reason": "Loan collateral - Personal loan application #PL-2024-001",
  "supportingDocuments": ["https://storage.example.com/doc1.pdf"]
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "status": "CREATED",
  "data": {
    "requestId": "lien-req-001",
    "accountId": "acc-123",
    "customerName": "John Doe",
    "accountNumber": "1234567890",
    "amount": 50000,
    "reason": "Loan collateral - Personal loan application #PL-2024-001",
    "status": "PENDING_TEAM_LEAD_REVIEW",
    "submittedBy": {
      "staffId": "staff-001",
      "staffName": "Jane Smith",
      "role": "RM"
    },
    "submittedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Authorization:** Requires `CAN_OPEN_ACCOUNT` permission (RM role)

---

#### 1.2 Get Lien Requests (with filtering)
```
GET /activate/liens/requests?status=PENDING_TEAM_LEAD_REVIEW&page=1&limit=20
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (optional): Filter by status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "status": "OK",
  "data": {
    "requests": [
      {
        "id": "lien-req-001",
        "accountId": "acc-123",
        "customerId": "cust-456",
        "customerName": "John Doe",
        "accountNumber": "1234567890",
        "amount": 50000,
        "reason": "Loan collateral",
        "status": "PENDING_TEAM_LEAD_REVIEW",
        "submittedBy": {
          "staffId": "staff-001",
          "staffName": "Jane Smith",
          "role": "RM"
        },
        "submittedAt": "2024-01-15T10:30:00Z",
        "reviewHistory": [
          {
            "reviewedBy": { "staffId": "...", "staffName": "...", "role": "TEAM_LEAD" },
            "action": "APPROVE",
            "comments": "Approved",
            "reviewedAt": "2024-01-15T11:00:00Z"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

**Authorization Logic:**
- **RM**: Can only see their own requests
- **Team Lead**: Can see requests from their team
- **CMO**: Can see all requests in their directorate
- **Operations**: Can see all approved requests pending placement

---

#### 1.3 Review Lien Request
```
POST /activate/liens/requests/:requestId/review
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "action": "APPROVE" | "REJECT",
  "comments": "Approved for further processing"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "status": "OK",
  "data": {
    "requestId": "lien-req-001",
    "status": "PENDING_CMO_REVIEW",
    "message": "Request approved and escalated to CMO"
  }
}
```

**Business Logic:**
- If status is `PENDING_TEAM_LEAD_REVIEW` → Move to `PENDING_CMO_REVIEW` on approve
- If status is `PENDING_CMO_REVIEW` → Move to `PENDING_OPERATIONS` on approve
- On reject at any stage → Move to `REJECTED`
- Add reviewer info and timestamp to `review_history`

**Authorization:**
- Team Lead: Can review `PENDING_TEAM_LEAD_REVIEW`
- CMO: Can review `PENDING_CMO_REVIEW`

---

#### 1.4 Place Lien from Request (Operations)
```
POST /activate/liens/place-from-request
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "requestId": "lien-req-001"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "status": "CREATED",
  "data": {
    "lienId": "lien-789",
    "requestId": "lien-req-001",
    "accountId": "acc-123",
    "amount": 50000,
    "status": "ACTIVE",
    "placedAt": "2024-01-15T14:00:00Z"
  }
}
```

**Business Logic:**
1. Verify request status is `PENDING_OPERATIONS`
2. Create actual lien on the account
3. Update request status to `APPROVED`
4. Return lien details

**Authorization:** Requires `CAN_PLACE_LIEN` permission (Operations role)

---

## 🆕 2. Customer Inflows (Task 3)

### API Endpoint

#### 2.1 Get Customer Inflows
```
GET /activate/customers/:customerId/inflows?page=1&limit=20&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `startDate` (optional): Filter from date (YYYY-MM-DD)
- `endDate` (optional): Filter to date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "status": "OK",
  "data": {
    "customerId": "cust-123",
    "customerName": "John Doe",
    "accountNumber": "1234567890",
    "inflows": [
      {
        "id": "inflow-001",
        "transactionRef": "TXN123456789",
        "amount": 150000,
        "currency": "NGN",
        "senderName": "ABC Company Ltd",
        "senderAccount": "9876543210",
        "senderBank": "Access Bank",
        "senderBankCode": "044",
        "channel": "BANK_TRANSFER",
        "narration": "Payment for services rendered - Invoice #INV-2024-001",
        "valueDate": "2024-01-15",
        "transactionDate": "2024-01-15T14:30:00Z",
        "status": "SUCCESSFUL"
      },
      {
        "id": "inflow-002",
        "transactionRef": "TXN987654321",
        "amount": 75000,
        "currency": "NGN",
        "senderName": "Jane Williams",
        "senderAccount": "1122334455",
        "senderBank": "GTBank",
        "senderBankCode": "058",
        "channel": "MOBILE_TRANSFER",
        "narration": "Salary payment",
        "valueDate": "2024-01-10",
        "transactionDate": "2024-01-10T09:15:00Z",
        "status": "SUCCESSFUL"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 145,
      "totalPages": 8
    },
    "summary": {
      "totalInflows": 145,
      "totalAmount": 12500000,
      "dateRange": {
        "from": "2024-01-01",
        "to": "2024-01-31"
      }
    }
  }
}
```

**Data Source:**
- Query transaction history table
- Filter for credit transactions (inflows only)
- Exclude internal transfers between customer's own accounts
- Sort by transaction date (descending)

**Authorization:** Requires access to customer data (RM, Team Lead, CMO roles)

**Performance Considerations:**
- Index on `customer_id`, `transaction_date`, `transaction_type`
- Consider caching for frequently accessed customers
- Implement efficient pagination with cursor-based pagination for large datasets

---

## 🔄 3. OTP Timer & Liveness Check (Task 4)

### 3.1 Modify Verification Session Response

Add timing fields to the verification session:

```json
{
  "id": "ver-123",
  "verificationType": "BVN",
  "identifierMasked": "221****6789",
  "status": "OTP_SENT",
  "otpSentAt": "2024-01-15T10:30:00Z",
  "otpExpiresAt": "2024-01-15T10:31:30Z",  // 90 seconds after sent
  "canResendAt": "2024-01-15T10:31:00Z",   // 60 seconds cooldown
  "resendCount": 0,
  "maxResendAttempts": 3,
  "verifiedFields": null,
  "createdAt": "2024-01-15T10:29:00Z"
}
```

**Business Logic:**
- When OTP is sent: Set `otpSentAt`, calculate `otpExpiresAt` (+90s), calculate `canResendAt` (+60s)
- Track `resendCount` and enforce `maxResendAttempts`
- If OTP expires and not verified, require resend
- Block resend requests if `Date.now() < canResendAt`

---

### 3.2 NEW: Liveness Verification Endpoint

```
POST /activate/verification/:verificationId/liveness
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA...",
  "verificationType": "BVN",
  "identifier": "22123456789"
}
```

**Response (Success):**
```json
{
  "success": true,
  "statusCode": 200,
  "status": "OK",
  "data": {
    "verificationId": "ver-123",
    "status": "BIODATA_RETRIEVED",
    "livenessCheckPassed": true,
    "livenessScore": 0.95,
    "livenessPhotoUrl": "https://storage.example.com/liveness/ver-123.jpg",
    "verifiedFields": {
      "firstName": "John",
      "lastName": "Doe",
      "middleName": "Michael",
      "phoneNumber": "08012345678",
      "dateOfBirth": "1990-05-15",
      "gender": "Male",
      "email": null,
      "address": "123 Main Street, Lagos"
    }
  }
}
```

**Response (Failed):**
```json
{
  "success": false,
  "statusCode": 400,
  "status": "BAD_REQUEST",
  "message": "Liveness check failed - Face does not match records",
  "data": {
    "verificationId": "ver-123",
    "status": "FAILED",
    "livenessCheckPassed": false,
    "failureReason": "Face mismatch"
  }
}
```

**Integration with QoreID:**
1. Receive base64 image from frontend (captured via QoreID SDK)
2. Forward image to QoreID face-verification API with BVN/NIN (`https://api.qoreid.com/v1/ng/identities/face-verification/{type}`)
3. QoreID performs liveness check and face match against national database
4. Store liveness photo in cloud storage (S3/Azure/GCS)
5. Update verification session with liveness result
6. Return verified biodata if successful

**Authorization:** Must own the verification session

---

## ✅ 4. Auto-populate Names from Verification (Task 5)

### Requirement
Ensure that when BVN/NIN verification is successful, the `verifiedFields` response **always** includes `firstName` and `lastName` populated from the provider's response.

### Implementation Checklist
- [ ] Map BVN provider response fields to `verifiedFields.firstName` and `verifiedFields.lastName`
- [ ] Map NIN provider response fields to `verifiedFields.firstName` and `verifiedFields.lastName`
- [ ] Make these fields **required** (non-nullable) in the API response schema
- [ ] Add validation: Verification cannot proceed to `BIODATA_RETRIEVED` status without names
- [ ] Handle edge cases where provider doesn't return names (rare - log and flag for manual review)

### Example Provider Response Mapping

**BVN Provider Response:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "middle_name": "Michael",
  "phone_number": "08012345678",
  "date_of_birth": "15-May-1990",
  ...
}
```

**Map to:**
```json
{
  "verifiedFields": {
    "firstName": "John",
    "lastName": "Doe",
    "middleName": "Michael",
    ...
  }
}
```

---

## 🆕 5. Branch Performance Dashboard (Task 6)

### API Endpoint

#### 5.1 Get Branch Dashboard
```
GET /activate/dashboard/branches?period=month&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer {token}
X-Reveal-Token: {pin_verification_token}
```

**Query Parameters:**
- `period` (optional): 'week' | 'month' | 'ytd'
- `startDate` (optional): Custom start date (YYYY-MM-DD)
- `endDate` (optional): Custom end date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "status": "OK",
  "data": {
    "view": "BRANCH",
    "summary": {
      "totalBranches": 5,
      "totalAccountsOpened": 240,
      "totalDepositCount": 180,
      "totalPortfolioValue": "1500000000.00",
      "totalMobileOnboarded": 150,
      "weeklyIncrement": "+12.5%"
    },
    "productBreakdown": {
      "savings": 160,
      "current": 80
    },
    "branches": [
      {
        "branchId": "branch-001",
        "branchName": "Lagos Island Branch",
        "branchCode": "LIB",
        "totalAccountsOpened": 50,
        "totalDepositCount": 40,
        "totalPortfolioValue": "350000000.00",
        "totalMobileOnboarded": 35,
        "weeklyIncrement": "+15%",
        "productBreakdown": {
          "savings": 30,
          "current": 20
        },
        "teamLeads": [
          {
            "teamLeadId": "staff-tl-001",
            "teamLeadName": "John Doe",
            "totalAccountsOpened": 25,
            "totalDepositCount": 20,
            "totalPortfolioValue": "175000000.00",
            "totalMobileOnboarded": 18,
            "rms": [
              {
                "staffId": "staff-rm-001",
                "staffName": "Jane Smith",
                "accountsOpened": 12,
                "depositCount": 10,
                "portfolioValue": "85000000.00",
                "mobileOnboarded": 9
              },
              {
                "staffId": "staff-rm-002",
                "staffName": "Bob Johnson",
                "accountsOpened": 13,
                "depositCount": 10,
                "portfolioValue": "90000000.00",
                "mobileOnboarded": 9
              }
            ]
          },
          {
            "teamLeadId": "staff-tl-002",
            "teamLeadName": "Alice Williams",
            "totalAccountsOpened": 25,
            "totalDepositCount": 20,
            "totalPortfolioValue": "175000000.00",
            "totalMobileOnboarded": 17,
            "rms": [...]
          }
        ]
      },
      {
        "branchId": "branch-002",
        "branchName": "Ikeja Branch",
        "branchCode": "IKJ",
        ...
      }
    ]
  }
}
```

### Database Query Structure

```sql
-- Pseudo-SQL for branch hierarchy aggregation
SELECT 
  b.id AS branchId,
  b.name AS branchName,
  b.code AS branchCode,
  COUNT(DISTINCT a.id) AS totalAccountsOpened,
  COUNT(DISTINCT d.id) AS totalDepositCount,
  SUM(pv.value) AS totalPortfolioValue,
  COUNT(DISTINCT m.id) AS totalMobileOnboarded
FROM branches b
LEFT JOIN staff tl ON tl.branch_id = b.id AND tl.role = 'TEAM_LEAD'
LEFT JOIN staff rm ON rm.team_lead_id = tl.id AND rm.role = 'RM'
LEFT JOIN accounts a ON a.opened_by_id = rm.id AND a.created_at BETWEEN ? AND ?
LEFT JOIN deposits d ON d.account_id = a.id AND d.created_at BETWEEN ? AND ?
LEFT JOIN portfolio_values pv ON pv.rm_id = rm.id AND pv.period = ?
LEFT JOIN mobile_activations m ON m.customer_id = a.customer_id AND m.created_at BETWEEN ? AND ?
GROUP BY b.id
ORDER BY totalPortfolioValue DESC;
```

### Authorization
- Requires `CAN_VIEW_BRANCH_DASHBOARD` permission
- Available to: CMO, MD, SUPER_ADMIN roles
- Respects directorate boundaries (CMO sees only their directorate)

### Performance Optimization
- Use materialized views or cached aggregates for better performance
- Update cache on daily/hourly basis
- Consider Redis caching for frequently accessed data
- Implement efficient pagination if branch count is large

---

## 🔐 Security & Authorization Summary

| Feature | Endpoint | Roles Allowed | Permissions Required |
|---------|----------|---------------|---------------------|
| Submit Lien Request | POST /liens/request | RM, ACCOUNT_OFFICER | CAN_OPEN_ACCOUNT |
| View Lien Requests | GET /liens/requests | RM, TEAM_LEAD, CMO, OPERATIONS | Role-based filtering |
| Review Lien (TL) | POST /liens/requests/:id/review | TEAM_LEAD | CAN_VIEW_TEAM_DASHBOARD |
| Review Lien (CMO) | POST /liens/requests/:id/review | CMO | CAN_VIEW_MANAGEMENT_DASHBOARD |
| Place Lien | POST /liens/place-from-request | OPERATIONS | CAN_PLACE_LIEN |
| Customer Inflows | GET /customers/:id/inflows | RM, TEAM_LEAD, CMO | CAN_VIEW_SENSITIVE_DATA |
| Liveness Check | POST /verification/:id/liveness | All authenticated | Own verification session |
| Branch Dashboard | GET /dashboard/branches | CMO, MD, SUPER_ADMIN | CAN_VIEW_BRANCH_DASHBOARD |

---

## 📝 Environment Variables

Add these to backend `.env`:

```bash
# QoreID Configuration
QOREID_CLIENT_ID=your_qoreid_client_id
QOREID_CLIENT_SECRET=your_qoreid_client_secret
QOREID_BASE_URL=https://api.qoreid.com

# Cloud Storage for Liveness Photos
CLOUD_STORAGE_BUCKET=regentmfb-liveness-photos
CLOUD_STORAGE_REGION=us-east-1

# OTP Configuration
OTP_EXPIRY_SECONDS=90
OTP_RESEND_COOLDOWN_SECONDS=60
OTP_MAX_RESEND_ATTEMPTS=3
```

---

## 🧪 Testing Checklist

### Lien Management
- [ ] RM can submit lien request
- [ ] Team Lead sees requests from their team only
- [ ] Team Lead can approve/reject requests
- [ ] Approved requests move to CMO queue
- [ ] CMO can approve/reject requests
- [ ] Approved requests move to Operations queue
- [ ] Operations can place lien from request
- [ ] Rejected requests don't proceed
- [ ] Review history is tracked correctly

### Customer Inflows
- [ ] Returns paginated inflow transactions
- [ ] Filters by date range correctly
- [ ] Excludes internal transfers
- [ ] Only shows credit transactions
- [ ] Performance is acceptable with large datasets

### OTP & Liveness
- [ ] OTP timer starts on send
- [ ] Resend blocked during cooldown period
- [ ] Liveness photo is stored securely
- [ ] Face match works with QoreID
- [ ] Failed liveness attempts are logged

### Name Auto-population
- [ ] BVN verification populates firstName/lastName
- [ ] NIN verification populates firstName/lastName
- [ ] Fields are non-editable in frontend when verified
- [ ] Missing names trigger validation error

### Branch Dashboard
- [ ] Hierarchy displays correctly (Branch → TL → RM)
- [ ] Aggregations are accurate
- [ ] Portfolio values require PIN to reveal
- [ ] Period filtering works
- [ ] Performance is acceptable with many branches

---

## 📊 Database Migration Scripts

### Migration 1: Lien Requests Table
```sql
-- Create lien_requests table
CREATE TABLE IF NOT EXISTS lien_requests (
  id VARCHAR(255) PRIMARY KEY,
  account_id VARCHAR(255) NOT NULL,
  customer_id VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  reason TEXT NOT NULL,
  supporting_documents JSON,
  status ENUM(
    'PENDING_TEAM_LEAD_REVIEW',
    'PENDING_CMO_REVIEW',
    'PENDING_OPERATIONS',
    'APPROVED',
    'REJECTED'
  ) NOT NULL DEFAULT 'PENDING_TEAM_LEAD_REVIEW',
  submitted_by_id VARCHAR(255) NOT NULL,
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  review_history JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (submitted_by_id) REFERENCES staff(id) ON DELETE CASCADE,
  
  INDEX idx_status (status),
  INDEX idx_submitted_by (submitted_by_id),
  INDEX idx_account (account_id),
  INDEX idx_created_at (created_at)
);
```

### Migration 2: Update Verification Sessions
```sql
-- Add liveness fields to verification_sessions table
ALTER TABLE verification_sessions
ADD COLUMN otp_sent_at TIMESTAMP NULL,
ADD COLUMN otp_expires_at TIMESTAMP NULL,
ADD COLUMN can_resend_at TIMESTAMP NULL,
ADD COLUMN resend_count INT DEFAULT 0,
ADD COLUMN max_resend_attempts INT DEFAULT 3,
ADD COLUMN liveness_photo_url VARCHAR(500) NULL,
ADD COLUMN liveness_check_passed BOOLEAN NULL,
ADD COLUMN liveness_score DECIMAL(3, 2) NULL;
```

---

## 🚀 Deployment Notes

1. **Database Migrations**: Run migrations in order before deploying new code
2. **Environment Variables**: Ensure all new env vars are set in production
3. **QoreID Integration**: Test QoreID API in staging before production
4. **Cloud Storage**: Configure cloud storage bucket with proper permissions
5. **Monitoring**: Add monitoring for:
   - Lien request workflow transitions
   - Failed liveness checks
   - OTP expiry/resend rates
   - Branch dashboard query performance

---

## 📞 Support Contacts

- **QoreID Support**: support@qoreid.com
- **Cloud Storage**: [Your cloud provider support]
- **Database Admin**: [Your DBA contact]

---

**Document Version:** 1.0  
**Last Updated:** June 10, 2026  
**Prepared By:** Development Team
