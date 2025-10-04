import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../utils/constants';
import type { User } from '../types';

/**
 * 사용자 프로필 생성
 */
export async function createUserProfile(
  uid: string,
  data: {
    email: string;
    nickname: string;
    phoneNumber: string;
  }
) {
  return setDoc(doc(db, COLLECTIONS.USERS, uid), {
    uid,
    email: data.email,
    nickname: data.nickname,
    phoneNumber: data.phoneNumber,
    createdAt: Timestamp.now(),
  });
}

/**
 * 사용자 프로필 수정
 */
export async function updateUserProfile(
  uid: string,
  data: Partial<Pick<User, 'nickname' | 'phoneNumber'>>
) {
  return updateDoc(doc(db, COLLECTIONS.USERS, uid), data);
}

/**
 * 사용자 프로필 조회
 */
export async function getUserProfile(uid: string): Promise<User | null> {
  const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));

  if (!userDoc.exists()) {
    return null;
  }

  return {
    uid: userDoc.id,
    ...userDoc.data(),
    createdAt: userDoc.data().createdAt?.toDate(),
  } as User;
}

/**
 * 사용자 서비스 객체 (선택적 사용)
 */
export const userService = {
  createUserProfile,
  updateUserProfile,
  getUserProfile,
};
