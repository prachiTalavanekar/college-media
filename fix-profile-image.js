// Run this in the browser console to fix the profile image issue

// Get the current user from localStorage
const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

// Update with the correct profile image URL from the database
const updatedUser = {
  ...currentUser,
  profileImage: 'https://res.cloudinary.com/dyzfa7ovn/image/upload/v1770470608/collegeconnect/profiles/y2tbrb8ieirswsyi8709.png',
  profileImagePublicId: 'collegeconnect/profiles/y2tbrb8ieirswsyi8709'
};

// Save back to localStorage
localStorage.setItem('user', JSON.stringify(updatedUser));

console.log('Profile image updated in localStorage:', updatedUser.profileImage);
console.log('Please refresh the page to see the changes');

// Optionally refresh the page
// window.location.reload();