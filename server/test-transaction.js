require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Request = require('./models/Request');
const Transaction = require('./models/Transaction');

async function runTest() {
  console.log('--- Starting Transaction & Points Test ---\n');

  try {
    // 1. Connect to DB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // 2. Create two test users
    const requester = new User({
      name: "Requester Bob",
      email: `bob${Date.now()}@test.com`,
      password: "password123"
    });
    const provider = new User({
      name: "Provider Alice",
      email: `alice${Date.now()}@test.com`,
      password: "password123"
    });

    await requester.save();
    await provider.save();

    console.log(`👤 Users Created:`);
    console.log(`   Bob (Requester) starting points: ${requester.points}`);
    console.log(`   Alice (Provider) starting points: ${provider.points}\n`);

    // 3. Bob creates a Request for 40 points
    console.log(`📝 Bob is creating a request for 40 points...`);
    const pointsOffered = 40;
    
    // Simulating the API logic: deduct points
    requester.points -= pointsOffered;
    await requester.save();

    const request = new Request({
      userId: requester._id,
      title: "Fix my sink",
      description: "It is leaking",
      category: "Plumbing",
      pointsOffered: pointsOffered
    });
    await request.save();

    console.log(`   ✅ Request created. Bob's points are now: ${requester.points}\n`);

    // 4. Alice accepts the Request
    console.log(`🤝 Alice accepts Bob's request...`);
    request.status = 'in-progress';
    await request.save();

    const transaction = new Transaction({
      requestId: request._id,
      requesterId: requester._id,
      providerId: provider._id,
      points: pointsOffered,
      status: 'in-progress'
    });
    await transaction.save();

    console.log(`   ✅ Transaction created. Status: ${transaction.status}\n`);

    // 5. Alice uploads proof
    console.log(`📸 Alice finished the job and uploaded proof...`);
    transaction.proofImages = ["https://res.cloudinary.com/dummy/image.jpg"];
    transaction.status = 'pending_confirmation';
    await transaction.save();
    
    console.log(`   ✅ Transaction status updated to: ${transaction.status}\n`);

    // 6. Bob confirms and points transfer
    console.log(`✅ Bob confirms the work was done well...`);
    transaction.status = 'completed';
    await transaction.save();

    request.status = 'completed';
    await request.save();

    provider.points += transaction.points;
    await provider.save();

    console.log(`   🎉 Transaction complete! Points transferred.\n`);

    // Final Balances
    console.log(`--- FINAL BALANCES ---`);
    console.log(`   Bob's points: ${requester.points} (Spent 40)`);
    console.log(`   Alice's points: ${provider.points} (Earned 40)`);

  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    mongoose.connection.close();
  }
}

runTest();
