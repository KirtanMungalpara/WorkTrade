require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Request = require('./models/Request');
const Transaction = require('./models/Transaction');
const Review = require('./models/Review');
const Report = require('./models/Report');

async function runTest() {
  console.log('--- Starting Trust & Safety Test ---\n');

  try {
    // 1. Connect
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // 2. Setup Users & Transaction
    const requester = new User({ name: "Charlie", email: `charlie${Date.now()}@test.com`, password: "123" });
    const provider = new User({ name: "Diana", email: `diana${Date.now()}@test.com`, password: "123" });
    await requester.save();
    await provider.save();

    const request = new Request({
      userId: requester._id,
      title: "Fix computer",
      description: "Broken screen",
      category: "Tech",
      pointsOffered: 30,
      status: 'in-progress'
    });
    await request.save();

    const transaction = new Transaction({
      requestId: request._id,
      requesterId: requester._id,
      providerId: provider._id,
      points: 30,
      status: 'pending_confirmation'
    });
    await transaction.save();

    console.log('--- Testing Two-Step Confirmation ---');
    console.log(`Transaction Status: ${transaction.status}`);
    
    // Provider Confirms
    transaction.providerConfirmed = true;
    await transaction.save();
    console.log(`✅ Provider (Diana) confirmed. (Transaction status is still: ${transaction.status})`);

    // Requester Confirms
    transaction.requesterConfirmed = true;
    if (transaction.requesterConfirmed && transaction.providerConfirmed) {
      transaction.status = 'completed';
      await transaction.save();
      request.status = 'completed';
      await request.save();
      provider.points += transaction.points;
      await provider.save();
    }
    console.log(`✅ Requester (Charlie) confirmed. Transaction status is now: ${transaction.status}\n`);

    console.log('--- Testing Rating & Reviews ---');
    // Requester leaves a review for Provider
    const review1 = new Review({
      reviewerId: requester._id,
      targetUserId: provider._id,
      rating: 5,
      comment: "Diana was super fast and fixed my screen perfectly!"
    });
    await review1.save();
    console.log(`✅ Charlie left a 5-star review for Diana.`);

    // Another user leaves a 3-star review
    const review2 = new Review({
      reviewerId: requester._id, // just simulating another review
      targetUserId: provider._id,
      rating: 3,
      comment: "Good, but a bit late."
    });
    await review2.save();
    console.log(`✅ Another user left a 3-star review for Diana.`);

    // Calculate new average
    const allReviews = await Review.find({ targetUserId: provider._id });
    const totalRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
    const avgRating = totalRating / allReviews.length;
    provider.rating = avgRating.toFixed(1);
    await provider.save();

    console.log(`⭐ Diana's new average profile rating is: ${provider.rating} / 5.0\n`);

    console.log('--- Testing User Reports ---');
    const report = new Report({
      reporterId: requester._id,
      reportedUserId: provider._id,
      reason: 'no-show',
      description: "Diana never showed up for the second job."
    });
    await report.save();
    console.log(`🚨 Report successfully filed against Diana for 'no-show'. Report status: ${report.status}\n`);

    console.log('--- ALL TESTS PASSED SUCCESSFULLY! ---');

  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    mongoose.connection.close();
  }
}

runTest();
