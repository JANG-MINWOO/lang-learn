import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../utils/constants';
import type { StudyRecord, StudyStats } from '../types';
import { convertDocumentData } from '../types/firebase';

/**
 * 학습 기록 저장 또는 업데이트
 * 같은 날짜에 여러 세션을 공부하면 누적됨
 */
export async function saveStudyRecord(
  userId: string,
  deckId: string,
  deckName: string,
  data: {
    cardsStudied: number;
    duration: number;
    stats: { again: number; hard: number; good: number; easy: number };
  }
): Promise<void> {
  // 오늘 날짜 (시간 제외)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 오늘 날짜의 문자열 ID 생성 (YYYY-MM-DD 형식)
  const dateStr = today.toISOString().split('T')[0];
  const recordId = `${userId}_${dateStr}`;

  const recordRef = doc(db, COLLECTIONS.STUDY_RECORDS, recordId);
  const existingDoc = await getDoc(recordRef);

  if (existingDoc.exists()) {
    // 기존 기록이 있으면 누적
    const existing = existingDoc.data();
    await setDoc(recordRef, {
      userId,
      deckId,
      deckName,
      studyDate: Timestamp.fromDate(today),
      cardsStudied: existing.cardsStudied + data.cardsStudied,
      duration: existing.duration + data.duration,
      stats: {
        again: existing.stats.again + data.stats.again,
        hard: existing.stats.hard + data.stats.hard,
        good: existing.stats.good + data.stats.good,
        easy: existing.stats.easy + data.stats.easy,
      },
      createdAt: existing.createdAt,
      updatedAt: Timestamp.now(),
    });
  } else {
    // 새로운 기록 생성
    await setDoc(recordRef, {
      userId,
      deckId,
      deckName,
      studyDate: Timestamp.fromDate(today),
      cardsStudied: data.cardsStudied,
      duration: data.duration,
      stats: data.stats,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }
}

/**
 * 월별 학습 기록 조회
 */
export async function getMonthlyStudyRecords(
  userId: string,
  year: number,
  month: number
): Promise<StudyRecord[]> {
  const startDate = new Date(year, month - 1, 1);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(year, month, 0);
  endDate.setHours(23, 59, 59, 999);

  const q = query(
    collection(db, COLLECTIONS.STUDY_RECORDS),
    where('userId', '==', userId),
    where('studyDate', '>=', Timestamp.fromDate(startDate)),
    where('studyDate', '<=', Timestamp.fromDate(endDate)),
    orderBy('studyDate', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) =>
    convertDocumentData(doc.id, doc.data()) as StudyRecord
  );
}

/**
 * 전체 학습 기록 조회
 */
export async function getAllStudyRecords(userId: string): Promise<StudyRecord[]> {
  const q = query(
    collection(db, COLLECTIONS.STUDY_RECORDS),
    where('userId', '==', userId),
    orderBy('studyDate', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) =>
    convertDocumentData(doc.id, doc.data()) as StudyRecord
  );
}

/**
 * 연속 학습 일수 계산
 */
function calculateStreaks(records: StudyRecord[]): {
  currentStreak: number;
  longestStreak: number;
} {
  if (records.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // 날짜를 오름차순으로 정렬
  const sortedRecords = [...records].sort(
    (a, b) => a.studyDate.getTime() - b.studyDate.getTime()
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 오늘 또는 어제 학습했는지 확인
  const lastStudyDate = new Date(sortedRecords[sortedRecords.length - 1].studyDate);
  lastStudyDate.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor(
    (today.getTime() - lastStudyDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // 오늘 또는 어제 공부했으면 현재 연속 기록 계산
  if (daysDiff <= 1) {
    currentStreak = 1;

    // 역순으로 연속 일수 계산
    for (let i = sortedRecords.length - 2; i >= 0; i--) {
      const currentDate = new Date(sortedRecords[i + 1].studyDate);
      currentDate.setHours(0, 0, 0, 0);

      const prevDate = new Date(sortedRecords[i].studyDate);
      prevDate.setHours(0, 0, 0, 0);

      const diff = Math.floor(
        (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // 최장 연속 기록 계산
  for (let i = 1; i < sortedRecords.length; i++) {
    const currentDate = new Date(sortedRecords[i].studyDate);
    currentDate.setHours(0, 0, 0, 0);

    const prevDate = new Date(sortedRecords[i - 1].studyDate);
    prevDate.setHours(0, 0, 0, 0);

    const diff = Math.floor(
      (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  return { currentStreak, longestStreak };
}

/**
 * 학습 통계 계산
 */
export async function calculateStudyStats(userId: string): Promise<StudyStats> {
  const allRecords = await getAllStudyRecords(userId);

  if (allRecords.length === 0) {
    return {
      totalDays: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalCards: 0,
      totalDuration: 0,
      averageCardsPerDay: 0,
      thisMonthDays: 0,
      thisMonthCards: 0,
    };
  }

  // 연속 학습 일수 계산
  const { currentStreak, longestStreak } = calculateStreaks(allRecords);

  // 전체 통계
  const totalCards = allRecords.reduce((sum, r) => sum + r.cardsStudied, 0);
  const totalDuration = allRecords.reduce((sum, r) => sum + r.duration, 0);
  const averageCardsPerDay = Math.round(totalCards / allRecords.length);

  // 이번 달 통계
  const today = new Date();
  const thisMonthRecords = allRecords.filter((r) => {
    const recordDate = new Date(r.studyDate);
    return (
      recordDate.getMonth() === today.getMonth() &&
      recordDate.getFullYear() === today.getFullYear()
    );
  });

  const thisMonthCards = thisMonthRecords.reduce(
    (sum, r) => sum + r.cardsStudied,
    0
  );

  return {
    totalDays: allRecords.length,
    currentStreak,
    longestStreak,
    totalCards,
    totalDuration,
    averageCardsPerDay,
    thisMonthDays: thisMonthRecords.length,
    thisMonthCards,
  };
}

/**
 * 학습 기록 서비스 객체
 */
export const studyRecordService = {
  saveStudyRecord,
  getMonthlyStudyRecords,
  getAllStudyRecords,
  calculateStudyStats,
};
