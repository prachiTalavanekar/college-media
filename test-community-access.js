// Simple test script to verify community access fix
// Run this in browser console after logging in as a student

async function testCommunityAccess() {
  try {
    console.log('Testing community access...');
    
    // Get communities list
    const communitiesResponse = await fetch('/api/communities', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const communitiesData = await communitiesResponse.json();
    console.log('Communities:', communitiesData.communities.map(c => ({
      name: c.name,
      isMember: c.isMember,
      canAccessContent: c.canAccessContent,
      hasPendingRequest: c.hasPendingRequest
    })));
    
    // Find a community the user is a member of
    const memberCommunity = communitiesData.communities.find(c => c.isMember);
    
    if (memberCommunity) {
      console.log('Testing access to member community:', memberCommunity.name);
      
      // Test debug endpoint
      try {
        const debugResponse = await fetch(`/api/communities/${memberCommunity._id}/debug-access`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const debugData = await debugResponse.json();
        console.log('Debug data:', debugData.debug);
      } catch (debugError) {
        console.log('Debug endpoint not available or failed:', debugError.message);
      }
      
      // Test community detail endpoint
      const detailResponse = await fetch(`/api/communities/${memberCommunity._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (detailResponse.ok) {
        const detailData = await detailResponse.json();
        console.log('✅ Community detail access successful:', {
          name: detailData.community.name,
          isMember: detailData.community.isMember,
          canAccessContent: detailData.community.canAccessContent
        });
        
        // Test if both endpoints return consistent results
        if (memberCommunity.isMember === detailData.community.isMember) {
          console.log('✅ Membership status is consistent between list and detail endpoints');
        } else {
          console.log('❌ Membership status inconsistent:', {
            listEndpoint: memberCommunity.isMember,
            detailEndpoint: detailData.community.isMember
          });
        }
      } else {
        console.error('❌ Community detail access failed:', detailResponse.status, await detailResponse.text());
      }
    } else {
      console.log('No member communities found. Testing with first available community...');
      
      const firstCommunity = communitiesData.communities[0];
      if (firstCommunity) {
        console.log('Testing with community:', firstCommunity.name, 'isMember:', firstCommunity.isMember);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testCommunityAccess();