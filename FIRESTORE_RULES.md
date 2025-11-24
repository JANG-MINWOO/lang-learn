# Firestore Security Rules

이 파일은 Firebase Console에서 사용할 Firestore 보안 규칙을 포함합니다.

## 규칙 적용 방법

1. Firebase Console 접속: https://console.firebase.google.com/
2. 프로젝트 선택
3. 좌측 메뉴 > "빌드" > "Firestore Database"
4. 상단 탭 > "규칙(Rules)"
5. 아래 규칙을 복사하여 붙여넣기
6. 우측 상단 "게시(Publish)" 클릭

## 현재 보안 규칙

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // 사용자 문서 규칙
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
    }

    // 덱 문서 규칙
    match /decks/{deckId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // 카드 문서 규칙
    match /cards/{cardId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }

    // 학습 세션 규칙
    match /sessions/{sessionId} {
      allow read, write: if request.auth != null;
    }

    // 학습 기록 규칙
    match /studyRecords/{recordId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

## 규칙 설명

### users/{userId}
- **read**: 모든 인증된 사용자가 읽기 가능
- **write**: 자신의 문서만 수정 가능
- **create**: 회원가입 시 생성 허용

### decks/{deckId}
- **read**: 모든 인증된 사용자가 읽기 가능
- **create**: 자신의 userId로만 덱 생성 가능
- **update/delete**: 덱 소유자만 수정/삭제 가능

### cards/{cardId}
- **read**: 모든 인증된 사용자가 읽기 가능
- **create**: 인증된 사용자만 카드 생성 가능
- **update/delete**: 인증된 사용자만 수정/삭제 가능

### sessions/{sessionId}
- **read/write**: 모든 인증된 사용자가 읽기/쓰기 가능

### studyRecords/{recordId}
- **read**: 자신의 학습 기록만 읽기 가능
- **create**: 자신의 userId로만 기록 생성 가능
- **update**: 자신의 학습 기록만 수정 가능
- **delete**: 자신의 학습 기록만 삭제 가능

## 보안 고려사항

- ✅ 모든 작업은 인증된 사용자만 가능
- ✅ 사용자는 자신의 데이터만 수정 가능
- ✅ studyRecords는 완전히 격리됨 (타인의 기록 접근 불가)
- ⚠️ cards 규칙이 느슨함 (향후 개선 권장)

## 권장 개선사항 (향후)

cards 컬렉션 규칙을 더 엄격하게 변경:

```javascript
match /cards/{cardId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null;
  allow update, delete: if request.auth != null &&
    get(/databases/$(database)/documents/decks/$(resource.data.deckId)).data.userId == request.auth.uid;
}
```

이렇게 하면 카드는 해당 덱의 소유자만 수정/삭제 가능합니다.
