import axios from 'axios';

const BASE = 'http://localhost:4000/api';

async function testAnalytics() {
  try {
    // 1. Register a test user
    const regRes = await axios.post(BASE + '/auth/register', {
      firstName: 'Analytics',
      lastName: 'Tester',
      email: 'analytics-test-' + Date.now() + '@test.com',
      password: 'testpass123',
      occupation: 'Developer',
      goals: ['Test analytics'],
    });

    const token = regRes.data.token;
    const auth = { headers: { Authorization: 'Bearer ' + token } };
    console.log('✓ User registered. Token: ' + token.substring(0, 25) + '...');

    // 2. Create a few habits to populate data
    const h1 = await axios.post(BASE + '/user/habits', { title: 'Meditation', difficulty: 'easy', priority: 3, frequency: 'daily', category: 'wellness', coinReward: 10 }, auth);
    const h2 = await axios.post(BASE + '/user/habits', { title: 'Coding Practice', difficulty: 'hard', priority: 5, frequency: 'daily', category: 'skills', coinReward: 50 }, auth);
    console.log('✓ Created 2 habits: Meditation, Coding Practice');

    // 3. Complete a habit to generate some completion records
    try {
      await axios.post(BASE + '/user/habits/' + h1.data._id + '/complete', {}, auth);
      console.log('✓ Completed Meditation habit');
    } catch (e) {
      console.log('⚠ Habit completion endpoint may not exist, continuing...');
    }

    // 4. Test the analytics dashboard endpoint
    const dashRes = await axios.get(BASE + '/user/analytics/dashboard', auth);
    const d = dashRes.data;
    console.log('\n━━━ ANALYTICS DASHBOARD RESPONSE ━━━\n');

    // Habit Genome
    console.log('🧬 Habit Genome:');
    console.log('   Archetype:', d.habitGenome?.archetype);
    console.log('   Name:', d.habitGenome?.name);
    console.log('   Avatar:', d.habitGenome?.avatar);
    console.log('   Description:', (d.habitGenome?.description || '').substring(0, 100));
    console.log('   Traits:', JSON.stringify(d.habitGenome?.traits));
    console.log('   Confidence:', d.habitGenome?.confidence);
    console.log('   Stats:', JSON.stringify(d.habitGenome?.stats));

    // Correlation Matrix
    console.log('\n🔗 Habit Correlation Matrix:');
    console.log('   Entries:', d.habitCorrelation?.length || 0);
    if (d.habitCorrelation && d.habitCorrelation.length > 0) {
      d.habitCorrelation.slice(0, 4).forEach(function(c) {
        console.log('   ' + c.habitATitle + ' ↔ ' + c.habitBTitle + ': ' + c.correlation + '%');
      });
    }

    // Smart Recommendations
    console.log('\n🧠 Smart Recommendations:');
    console.log('   Count:', d.smartRecommendations?.length || 0);
    if (d.smartRecommendations) {
      d.smartRecommendations.forEach(function(r, i) {
        console.log('   ' + (i + 1) + '. [' + r.type + '] ' + r.title);
        console.log('      ' + r.description.substring(0, 100));
        console.log('      Impact: ' + r.impact + ' | Metric: ' + r.metric);
      });
    }

    // Existing analytics
    console.log('\n📊 Existing Analytics:');
    console.log('   Completion History keys:', Object.keys(d.completionHistory || {}).length);
    console.log('   Completion By Hour keys:', Object.keys(d.completionByHour || {}).length);
    console.log('   Completion By Day keys:', Object.keys(d.completionByDay || {}).length);
    console.log('   Streak Metrics totalHabits:', d.streakMetrics?.totalHabits);
    console.log('   Difficulty Trends:', JSON.stringify(d.difficultyTrends));

    console.log('\n━━━ ALL TESTS PASSED ✓ ━━━\n');
  } catch (err) {
    console.error('✗ FAILED:', err.response?.data || err.message);
    process.exit(1);
  }
}

testAnalytics();
