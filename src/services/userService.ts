import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  Timestamp,
  query,
  collection,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../utils/constants';
import type { User } from '../types';

/**
 * 이메일로 사용자 찾기
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  const q = query(
    collection(db, COLLECTIONS.USERS),
    where('email', '==', email)
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const userDoc = querySnapshot.docs[0];
  return {
    uid: userDoc.id,
    ...userDoc.data(),
    createdAt: userDoc.data().createdAt?.toDate(),
  } as User;
}

/**
 * 사용자 프로필 생성
 */
export async function createUserProfile(
  uid: string,
  data: {
    email: string;
    nickname: string;
    phoneNumber: string;
    provider: 'email' | 'google';
  }
) {
  return setDoc(doc(db, COLLECTIONS.USERS, uid), {
    uid,
    email: data.email,
    nickname: data.nickname,
    phoneNumber: data.phoneNumber,
    provider: data.provider,
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
 * 사용자 provider 업데이트 (이메일 계정을 구글로 전환)
 */
export async function updateUserProvider(
  uid: string,
  provider: 'email' | 'google'
) {
  return updateDoc(doc(db, COLLECTIONS.USERS, uid), { provider });
}

/**
 * 사용자 서비스 객체 (선택적 사용)
 */
export const userService = {
  findUserByEmail,
  createUserProfile,
  updateUserProfile,
  getUserProfile,
  updateUserProvider,
};
