import { 
  collection,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from './firebase';
import bcrypt from 'bcryptjs';

// Check if username exists
export const checkUsernameExists = async (username) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking username:', error);
    throw error;
  }
};

// Register new user
export const registerUser = async (username, password) => {
  try {
    // Check if username already exists
    const exists = await checkUsernameExists(username);
    if (exists) {
      return { success: false, error: 'Username already exists' };
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user document with username as document ID
    const userRef = doc(db, 'users', username);
    await setDoc(userRef, {
      username: username,
      password: hashedPassword,
      level: 0,
      bestScore: 0,
      createdAt: new Date().toISOString()
    });

    return { success: true, username };
  } catch (error) {
    console.error('Error registering user:', error);
    return { success: false, error: error.message };
  }
};

// Login user
export const loginUser = async (username, password) => {
  try {
    // Get user document
    const userRef = doc(db, 'users', username);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { success: false, error: 'Invalid username or password' };
    }

    const userData = userSnap.data();

    // Verify password
    const isValid = await bcrypt.compare(password, userData.password);

    if (!isValid) {
      return { success: false, error: 'Invalid username or password' };
    }

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = userData;
    return { success: true, user: userWithoutPassword };
  } catch (error) {
    console.error('Error logging in:', error);
    return { success: false, error: error.message };
  }
};

// Get user data
export const getUserData = async (username) => {
  try {
    const userRef = doc(db, 'users', username);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { success: false, error: 'User not found' };
    }

    const userData = userSnap.data();
    const { password: _, ...userWithoutPassword } = userData;
    return { success: true, user: userWithoutPassword };
  } catch (error) {
    console.error('Error getting user data:', error);
    return { success: false, error: error.message };
  }
};

// Update user progress
export const updateUserProgress = async (username, level, bestScore) => {
  try {
    const userRef = doc(db, 'users', username);
    const updates = {};
    
    if (level !== undefined) updates.level = level;
    if (bestScore !== undefined) updates.bestScore = bestScore;

    await setDoc(userRef, updates, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error updating user progress:', error);
    return { success: false, error: error.message };
  }
};
