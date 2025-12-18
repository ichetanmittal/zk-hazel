# 🚀 QUICK START GUIDE - Hazel Trade

## Prerequisites

Before starting, ensure you have:
- ✅ Supabase project created
- ✅ Database migration run (001_initial_schema.sql)
- ✅ Environment variables configured

## 🔧 Setup Steps

### 1. Create Supabase Storage Bucket

**IMPORTANT**: This must be done before testing uploads!

1. Go to your Supabase Dashboard
2. Navigate to **Storage** section
3. Click **"New Bucket"**
4. Name: `documents`
5. Set to: **Private** (not public)
6. Click **"Create Bucket"**

### 2. Verify Environment Variables

Check your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🧪 Test the Complete Matching Flow

### Scenario: Create and Complete a Deal

#### Step 1: Create a Deal (as Broker)

1. Go to `http://localhost:3000/auth/signup?role=broker`
2. Sign up as a broker
3. Go to Dashboard → Click **"+ New Deal"**
4. Fill out the form:
   - Product: Jet A1
   - Quantity: 50000 MT
   - Value: $34,300,000
   - Location: Rotterdam
   - Buyer Email: `buyer@test.com`
   - Seller Email: `seller@test.com`
   - Commission: 0.5%
5. Click **"Create Deal"**
6. **Copy both invite links** (buyer and seller)

#### Step 2: Buyer Verification

1. Open a **new incognito window**
2. Paste the **buyer invite link**
3. Click **"Get Started"**
4. Sign up:
   - Full Name: John Buyer
   - Email: buyer@test.com
   - Password: password123
   - Company Name: Apex Commodities
   - Country: United States
   - Registration Number: 123456
   - Year: 2020
   - Company Type: Corporation
   - Address: 123 Main St, NYC
5. You'll be redirected to **Verification Page**
6. Select **Document Type**: MT799 (or any POF type)
7. Upload **any PDF file**
8. Click **"Upload & Verify"**
9. Wait 3 seconds → See "Verification Complete ✓"
10. Redirected to dashboard

#### Step 3: Seller Verification

1. Open **another incognito window**
2. Paste the **seller invite link**
3. Sign up:
   - Full Name: Jane Seller
   - Email: seller@test.com
   - Password: password123
   - Company Name: Vitol Trading
   - (fill other company details)
5. Redirected to **Verification Page**
6. Select **Document Type**: TSA (or any POP type)
7. Upload **any PDF file**
8. Click **"Upload & Verify"**
9. Wait 3 seconds → See "Verification Complete ✓"

#### Step 4: Check Matching (as Broker)

1. Go back to **broker's browser**
2. **Refresh the dashboard**
3. You should see:
   - ✅ Deal status changed to **"MATCHED"**
   - ✅ Both "Buyer Verified" and "Seller Verified" badges
   - ✅ `matched_at` timestamp set

4. Click on the deal
5. Click **"Data Room"** button
6. You should see:
   - ✅ POF folder unlocked (showing buyer's document)
   - ✅ POP folder unlocked (showing seller's document)
   - ✅ Other folders locked with unlock conditions

#### Step 5: Progress Through Workflow

1. Click back to deal page
2. Click **"Step 1: NCNDA / IMFPA"**
3. Upload a document (any PDF)
4. Click **"Mark Complete"**
5. Confirm → Step 1 marked complete
6. Notice:
   - ✅ Step 1 status: COMPLETED
   - ✅ Step 2 status: IN_PROGRESS
   - ✅ Deal current_step: 2
7. Repeat for other steps!

---

## 🎯 Expected Results

### After Buyer Upload:
```
✓ Document stored in Supabase Storage
✓ Document record created in database
✓ deal.buyer_verified = true
✓ Notification created
✓ POF folder unlocks in Data Room
```

### After Seller Upload:
```
✓ Document stored in Supabase Storage
✓ Document record created in database
✓ deal.seller_verified = true
✓ Notification created
✓ POP folder unlocks in Data Room
```

### After Both Verified (MATCH):
```
✓ Database trigger fires automatically
✓ deal.status = 'MATCHED'
✓ deal.matched_at = [current timestamp]
✓ Both POF and POP folders visible to each other
✓ Workflow steps become active
```

### After Step Completion:
```
✓ Current step marked COMPLETED
✓ deal.current_step increments
✓ Next step marked IN_PROGRESS
✓ Notifications sent to all parties
```

---

## 🐛 Troubleshooting

### Issue: "Upload failed"
**Solution**: Make sure Supabase Storage bucket "documents" is created

### Issue: "Verification status not changing"
**Solution**:
1. Check browser console for errors
2. Verify database trigger exists:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'deal_match_trigger';
   ```

### Issue: "Deal not visible to buyer/seller"
**Solution**: Check that:
- User's company_id is set
- Deal's buyer_id or seller_id matches user's company_id
- Check in Supabase Dashboard → Table Editor

### Issue: "Can't see other party's documents"
**Solution**:
- Verify both parties are verified (buyer_verified AND seller_verified = true)
- Check deal status is 'MATCHED'
- Check document visibility flags in database

---

## 📊 Database Queries for Debugging

### Check Deal Status:
```sql
SELECT
  deal_number,
  status,
  buyer_verified,
  seller_verified,
  matched_at,
  current_step
FROM deals
WHERE id = 'your-deal-id';
```

### Check Documents:
```sql
SELECT
  filename,
  folder,
  verification_status,
  verified_at
FROM documents
WHERE deal_id = 'your-deal-id';
```

### Check Step Status:
```sql
SELECT
  step_number,
  step_name,
  status,
  started_at,
  completed_at
FROM deal_steps
WHERE deal_id = 'your-deal-id'
ORDER BY step_number;
```

---

## 🎉 Success Indicators

You know it's working when:

1. ✅ Buyer uploads POF → See "Verification Complete"
2. ✅ Seller uploads POP → See "Verification Complete"
3. ✅ Deal status automatically changes to "MATCHED"
4. ✅ Data Room shows unlocked folders
5. ✅ Can view each other's documents
6. ✅ Can progress through steps
7. ✅ Current step advances automatically

---

## 🚀 Next Steps

Once the flow is working:

1. Test all 12 steps
2. Test as different roles (buyer/seller/broker)
3. Test document uploads for each step
4. Verify notifications are created
5. Test Data Room folder unlocking at each stage
6. Deploy to production when ready!

---

## 📞 Need Help?

Check the logs:
- Browser console for frontend errors
- Terminal for backend errors
- Supabase Dashboard → Logs for database errors

Check the implementation:
- See `IMPLEMENTATION_SUMMARY.md` for complete details
- See code comments for specific logic

---

**Happy Trading!** 🎉
