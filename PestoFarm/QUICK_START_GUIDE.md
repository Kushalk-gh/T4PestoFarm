# PestoFarm - QUICK START GUIDE

## 🚀 Start All Services in 3 Steps

### Step 1: Start Backend (Java Spring Boot)
```powershell
cd "c:\Users\Admin\Desktop\PestoFarm-GitHub-backup(Nov 15)\PESTOFARM\pestofarm(liki backend)\pestofarm\ecommerce"
.\mvnw.cmd spring-boot:run
```
✅ **Backend runs on:** http://localhost:5454

### Step 2: Start Frontend (React)
```powershell
cd "c:\Users\Admin\Desktop\PestoFarm-GitHub-backup(Nov 15)\PESTOFARM\pestofarm-new-react(13th Nov)"
npm install --legacy-peer-deps  # (only first time, or if node_modules missing)
npm start
```
✅ **Frontend runs on:** http://localhost:3000

### Step 3: Start Chatbot (Optional - Python Flask)
```powershell
cd "c:\Users\Admin\Desktop\PestoFarm-GitHub-backup(Nov 15)\PESTOFARM\NewChatbot\Liki-nlp-pesticide-chatbot\nlp-pesticide-chatbot"
python app.py
```
✅ **Chatbot runs on:** http://localhost:5000

---

## 🧪 QUICK TESTING (Copy-Paste Commands)

### Test 1: Backend Health Check
```
GET http://localhost:5454/api/health
```
Or in PowerShell:
```powershell
Invoke-WebRequest -Uri "http://localhost:5454/api/health" -Method GET
```

### Test 2: List All Products
```
GET http://localhost:5454/api/products
```
Response will show all products in database with pagination.

### Test 3: Customer Login
```powershell
$body = @{
    email = "customer@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5454/auth/signin" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```
✅ **Success:** Returns JWT token in response body

### Test 4: Seller Login
```powershell
$body = @{
    email = "seller@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5454/api/sellers/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### Test 5: Create Product (Seller)
```powershell
$jwt = "YOUR_JWT_TOKEN_HERE"  # Get from seller login

$body = @{
    title = "Tomato Seeds - Test"
    description = "Test product"
    mrpPrice = 225
    sellingPrice = 158
    discountPercent = 30
    quantity = 100
    images = @()
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5454/api/sellers/products" `
    -Method POST `
    -Headers @{ "Authorization" = $jwt } `
    -ContentType "application/json" `
    -Body $body
```

### Test 6: Admin Delete Product (Admin)
```powershell
$jwt = "ADMIN_JWT_TOKEN"  # Must be admin email user
$productId = 1  # Replace with actual product ID

Invoke-WebRequest -Uri "http://localhost:5454/api/admin/products/$productId" `
    -Method DELETE `
    -Headers @{ "Authorization" = $jwt }
```

### Test 7: List All Users (Admin Only)
```powershell
$jwt = "ADMIN_JWT_TOKEN"

Invoke-WebRequest -Uri "http://localhost:5454/api/admin/users" `
    -Method GET `
    -Headers @{ "Authorization" = $jwt }
```

---

## 📊 VERIFY DATABASE

### Check MySQL Connection
```powershell
# First, ensure MySQL is running
# Then open MySQL CLI (if installed)
mysql -u root -p pestofarm
```

### Check Tables Created
```sql
SHOW TABLES;
```

Expected tables:
- users
- products  
- orders
- order_items
- reviews
- favorites/wishlist
- sellers
- scientists
- categories

### Count Records
```sql
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as product_count FROM products;
SELECT COUNT(*) as order_count FROM orders;
```

---

## 🔐 ADMIN ACCESS

### Set Admin Email
Edit `src/config/admins.ts`:
```typescript
const ADMIN_EMAILS = [
  'admin@pestofarm.com',
  'superadmin@pestofarm.com'
];
```

### Create Admin User (if doesn't exist)
1. Go to http://localhost:3000/login
2. Enter email: `admin@pestofarm.com` (must match ADMIN_EMAILS list)
3. Password: any password
4. Click "Sign Up as Customer" (creates user)
5. Next login with same email → Auto-redirect to /admin-home

### Verify Admin Dashboard
- Navigate to: http://localhost:3000/admin-home
- Should show admin controls (Manage Users, Manage Products, etc.)

---

## 🐛 COMMON ISSUES & FIXES

### Issue: "npm install" hangs or fails
**Solution:**
```powershell
# Option 1: Use --force
npm install --legacy-peer-deps --force

# Option 2: Clear cache and retry
npm cache clean --force
npm install --legacy-peer-deps

# Option 3: Use specific Node version
nvm install 18
nvm use 18
npm install --legacy-peer-deps
```

### Issue: Backend port 5454 already in use
**Solution:**
```powershell
# Find process using port
netstat -ano | Select-String ":5454"

# Kill process (replace PID with actual number)
Stop-Process -Id <PID> -Force

# Or change port in backend config
# Edit: pestofarm(liki backend)/pestofarm/ecommerce/src/main/resources/application.properties
# Add: server.port=8080
```

### Issue: CORS errors from frontend
**Solution:**
Backend should have CORS enabled. Check `AppConfig.java`:
```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
    configuration.setAllowedMethods(Arrays.asList("*"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    // ... rest of config
}
```

### Issue: JWT "Invalid Token" error
**Solution:**
- Ensure JWT is sent WITHOUT "Bearer " prefix
- Check: Authorization header should be raw JWT only
- Verify: JWT not expired (check exp claim)
- Verify: Same secret key used for signing/verification

### Issue: Database connection failed
**Solution:**
```powershell
# Ensure MySQL running
mysql --version  # Should show version

# Test connection
mysql -u root -p -e "SELECT 1;"

# Check backend logs for Hikari connection details
# Should show: "Hikari Connection Pool initialized"
```

---

## 📝 USER ACCOUNTS FOR TESTING

### Pre-created Test Users (Add these to DB)
```sql
-- Customer
INSERT INTO users (email, password, full_name, phone, role) 
VALUES ('customer@example.com', 'hashed_password_123', 'Test Customer', '9876543210', 'CUSTOMER');

-- Seller
INSERT INTO sellers (email, full_name, phone, address, account_status) 
VALUES ('seller@example.com', 'Test Seller', '9876543211', '123 Business St', 'APPROVED');

-- Scientist
INSERT INTO scientists (email, full_name, phone, specialization) 
VALUES ('scientist@example.com', 'Test Scientist', '9876543212', 'Entomology');

-- Admin
INSERT INTO users (email, password, full_name, phone, role) 
VALUES ('admin@pestofarm.com', 'hashed_password_123', 'Admin User', '9876543213', 'ADMIN');
```

### Test Credentials
| Role | Email | Password |
|------|-------|----------|
| Customer | customer@example.com | password123 |
| Seller | seller@example.com | password123 |
| Scientist | scientist@example.com | password123 |
| Admin | admin@pestofarm.com | password123 |

---

## ✅ FINAL VERIFICATION CHECKLIST

Before declaring complete:

- [ ] Backend runs without errors on port 5454
- [ ] Frontend runs without errors on port 3000
- [ ] Can login as customer/seller/scientist/admin
- [ ] Seller can add/edit/delete products
- [ ] Products display to customers in real-time
- [ ] Customer can place order
- [ ] Can cancel order from MyOrders
- [ ] Order details modal shows correct info
- [ ] Can add/remove from favorites
- [ ] Admin can access /admin-home
- [ ] Admin can delete users/products
- [ ] Reviews work for delivered orders
- [ ] All API endpoints return correct data
- [ ] Database has no connection issues
- [ ] No CORS errors in console
- [ ] JWT stored in localStorage
- [ ] No "Bearer " prefix in Authorization header

---

## 📞 API REFERENCE (Quick Copy-Paste)

### Authentication
```
POST   /auth/signup                    (Customer registration)
POST   /auth/signin                    (Customer login)
POST   /api/sellers/register           (Seller registration)
POST   /api/sellers/login              (Seller login)
POST   /api/scientists/register        (Scientist registration)
POST   /api/scientists/login           (Scientist login)
```

### Products
```
GET    /api/products                   (List products, paginated)
GET    /api/products/{id}              (Get product details)
POST   /api/sellers/products           (Create product - Seller)
PUT    /api/sellers/products/{id}      (Update product - Seller)
DELETE /api/sellers/products/{id}      (Delete product - Seller)
GET    /api/admin/products             (List all products - Admin)
DELETE /api/admin/products/{id}        (Delete product - Admin)
```

### Orders
```
POST   /api/orders                     (Create order)
GET    /api/orders                     (List user orders)
GET    /api/orders/{id}                (Get order details)
PUT    /api/orders/{id}/cancel         (Cancel order)
```

### Reviews
```
POST   /api/products/{id}/reviews      (Create review)
GET    /api/products/{id}/reviews      (Get product reviews)
PUT    /api/reviews/{id}               (Update review)
DELETE /api/reviews/{id}               (Delete review)
GET    /api/reviews/check-eligibility  (Check review eligibility)
```

### Admin
```
GET    /api/admin/users                (List all users)
DELETE /api/admin/users/{id}           (Delete user)
GET    /api/admin/products             (List all products)
DELETE /api/admin/products/{id}        (Delete product)
PATCH  /api/admin/seller/{id}/status/{status}  (Update seller status)
```

### Favorites
```
POST   /api/favorites?productId={id}   (Add to favorites)
DELETE /api/favorites/{id}             (Remove from favorites)
GET    /api/favorites                  (List favorites)
```

---

## 🎯 SUCCESS CRITERIA

### Application is READY when:
1. ✅ All 14 tasks completed
2. ✅ All E2E tests pass (Phase 1-7, 42+ test cases)
3. ✅ No errors in browser console
4. ✅ No errors in backend logs
5. ✅ Database contains real data (users, products, orders)
6. ✅ All API endpoints respond with correct data
7. ✅ Full user flow works: Register → Complete Profile → Add Product → Order → Review
8. ✅ Admin functions verified
9. ✅ Chatbot integrated and working
10. ✅ Final report generated

---

## 📚 ADDITIONAL RESOURCES

- **E2E Testing Guide:** `E2E_TESTING_AND_DEPLOYMENT_GUIDE.md`
- **14-Task Report:** `14_TASKS_COMPLETION_REPORT.md`
- **Backend Code:** `pestofarm(liki backend)/pestofarm/ecommerce/src/`
- **Frontend Code:** `pestofarm-new-react(13th Nov)/src/`
- **Chatbot Code:** `NewChatbot/Liki-nlp-pesticide-chatbot/nlp-pesticide-chatbot/`

---

**Last Updated:** November 18, 2025  
**Status:** READY FOR TESTING ✅
