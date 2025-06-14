import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Topic, Tip, TutorialState } from '../models/tutorial.model';

@Injectable({
  providedIn: 'root'
})
export class TutorialService {
  private state = new BehaviorSubject<TutorialState>({
    topics: [],
    currentTips: [],
    currentTipIndex: 0,
    searchQuery: '',
    loading: false,
    readTips: new Set<string>()
  });

  public state$ = this.state.asObservable();

  // Add getter to access current state value
  public get currentState(): TutorialState {
    return this.state.value;
  }

  private mockTips: Tip[] = [
    // נושא 1: ניהול משתמשים - 5 טיפים
    {
      id: '1',
      topicId: '1',
      title: 'יצירת משתמש חדש',
      content: 'כדי ליצור משתמש חדש, עבור לכרטיסייה "משתמשים" ולחץ על כפתור "הוסף משתמש". מלא את כל השדות הנדרשים ובחר את ההרשאות המתאימות. ניתן להגדיר סיסמה זמנית או לשלוח הזמנה במייל.',
      imageUrl: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800',
      isNew: true,
      order: 1
    },
    {
      id: '2',
      topicId: '1',
      title: 'עריכת פרטי משתמש',
      content: 'לעריכת פרטי משתמש קיים, חפש את המשתמש ברשימה ולחץ על איקון העריכה. ניתן לעדכן את כל הפרטים למעט שם המשתמש. שים לב לשמור את השינויים לפני יציאה מהדף.',
      imageUrl: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
      isNew: false,
      order: 2
    },
    {
      id: '3',
      topicId: '1',
      title: 'הגדרת הרשאות',
      content: 'ניתן להגדיר הרשאות ספציפיות לכל משתמש או קבוצת משתמשים. עבור לתפריט "הרשאות" ובחר את הרמות הרצויות. הרשאות כוללות: קריאה, כתיבה, מחיקה וניהול.',
      imageUrl: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800',
      isNew: false,
      order: 3
    },
    {
      id: '4',
      topicId: '1',
      title: 'מחיקת משתמש',
      content: 'למחיקת משתמש, בחר את המשתמש מהרשימה ולחץ על איקון המחיקה. שים לב שפעולה זו בלתי הפיכה. מומלץ לגבות את הנתונים לפני המחיקה.',
      imageUrl: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
      isNew: false,
      order: 4
    },
    {
      id: '5',
      topicId: '1',
      title: 'ייבוא משתמשים מקובץ',
      content: 'ניתן לייבא משתמשים רבים בבת אחת מקובץ Excel או CSV. עבור לתפריט "ייבוא" ובחר את הקובץ המתאים. וודא שהקובץ מכיל את כל השדות הנדרשים.',
      imageUrl: 'https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg?auto=compress&cs=tinysrgb&w=800',
      isNew: true,
      order: 5
    },

    // נושא 2: דוחות ואנליטיקה - 8 טיפים
    {
      id: '6',
      topicId: '2',
      title: 'יצירת דוח חדש',
      content: 'ליצירת דוח חדש, עבור לכרטיסייה "דוחות" ובחר את סוג הדוח הרצוי. הגדר את הפרמטרים והתאריכים ולחץ על "צור דוח". ניתן לבחור מתוך תבניות קיימות או ליצור דוח מותאם אישית.',
      imageUrl: 'https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg?auto=compress&cs=tinysrgb&w=800',
      isNew: true,
      order: 1
    },
    {
      id: '7',
      topicId: '2',
      title: 'ייצוא נתונים',
      content: 'ניתן לייצא נתונים בפורמטים שונים כמו Excel, PDF או CSV. בחר את הנתונים הרצויים ולחץ על "ייצא". הייצוא יכלול את כל המסננים והמיונים שהוגדרו.',
      imageUrl: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
      isNew: false,
      order: 2
    },
    {
      id: '8',
      topicId: '2',
      title: 'הגדרת מסננים',
      content: 'השתמש במסננים כדי לצמצם את הנתונים המוצגים בדוח. ניתן לסנן לפי תאריכים, משתמשים או קטגוריות. מסננים מתקדמים מאפשרים שילוב של מספר תנאים.',
      imageUrl: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800',
      isNew: false,
      order: 3
    },
    {
      id: '9',
      topicId: '2',
      title: 'שמירת דוח כתבנית',
      content: 'לאחר יצירת דוח, ניתן לשמור אותו כתבנית לשימוש עתידי. לחץ על "שמור כתבנית" ותן שם לתבנית. התבנית תשמור את כל ההגדרות והמסננים.',
      imageUrl: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
      isNew: true,
      order: 4
    },
    {
      id: '10',
      topicId: '2',
      title: 'תזמון דוחות אוטומטיים',
      content: 'הגדר דוחות שיישלחו אוטומטית במועדים קבועים. עבור להגדרות הדוח ובחר "תזמון אוטומטי". ניתן להגדיר שליחה יומית, שבועית או חודשית.',
      imageUrl: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800',
      isNew: false,
      order: 5
    },
    {
      id: '11',
      topicId: '2',
      title: 'ניתוח טרנדים',
      content: 'השתמש בכלי הניתוח המתקדמים כדי לזהות טרנדים ודפוסים בנתונים שלך. הכלים כוללים גרפים, תרשימים ואנליזה סטטיסטית.',
      imageUrl: 'https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg?auto=compress&cs=tinysrgb&w=800',
      isNew: true,
      order: 6
    },
    {
      id: '12',
      topicId: '2',
      title: 'שיתוף דוחות',
      content: 'שתף דוחות עם חברי הצוות או לקוחות באמצעות קישור או שליחה במייל. ניתן להגדיר הרשאות צפייה או עריכה לכל משתמש.',
      imageUrl: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
      isNew: false,
      order: 7
    },
    {
      id: '13',
      topicId: '2',
      title: 'דשבורד אישי',
      content: 'צור דשבורד אישי עם הדוחות והמדדים החשובים לך ביותר. הדשבורד יתעדכן אוטומטיות ויציג את המידע העדכני ביותר.',
      imageUrl: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800',
      isNew: true,
      order: 8
    },

    // נושא 3: הגדרות מערכת - 6 טיפים
    {
      id: '14',
      topicId: '3',
      title: 'הגדרות כלליות',
      content: 'עבור להגדרות המערכת כדי לקבוע את השפה, אזור הזמן והעדפות התצוגה. הגדרות אלו ישפיעו על כל המשתמשים במערכת.',
      imageUrl: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
      isNew: false,
      order: 1
    },
    {
      id: '15',
      topicId: '3',
      title: 'הגדרת התראות',
      content: 'קבע אילו התראות תרצה לקבל ובאיזה אופן - במייל, SMS או בתוך המערכת. ניתן להגדיר התראות שונות לאירועים שונים.',
      imageUrl: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800',
      isNew: true,
      order: 2
    },
    {
      id: '16',
      topicId: '3',
      title: 'ניהול רישיונות',
      content: 'צפה במצב הרישיונות הנוכחי והוסף או הסר רישיונות לפי הצורך. המערכת תתריע כאשר הרישיונות עומדים להסתיים.',
      imageUrl: 'https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg?auto=compress&cs=tinysrgb&w=800',
      isNew: false,
      order: 3
    },
    {
      id: '17',
      topicId: '3',
      title: 'הגדרות אינטגרציה',
      content: 'חבר את המערכת למערכות חיצוניות כמו CRM, ERP או כלי שיתוף. האינטגרציה תאפשר סנכרון נתונים אוטומטי.',
      imageUrl: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
      isNew: true,
      order: 4
    },
    {
      id: '18',
      topicId: '3',
      title: 'עדכון גרסה',
      content: 'בדוק אם יש עדכונים זמינים ועדכן את המערכת לגרסה החדשה ביותר. מומלץ לגבות את המערכת לפני העדכון.',
      imageUrl: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800',
      isNew: false,
      order: 5
    },
    {
      id: '19',
      topicId: '3',
      title: 'ניהול לוגים',
      content: 'צפה בלוגי המערכת, הגדר רמות לוגינג וארכב לוגים ישנים. הלוגים עוזרים לאבחן בעיות ולעקוב אחר פעילות המערכת.',
      imageUrl: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
      isNew: true,
      order: 6
    },

    // נושא 4: אבטחה והרשאות - 4 טיפים
    {
      id: '20',
      topicId: '4',
      title: 'הגדרת מדיניות סיסמאות',
      content: 'קבע דרישות לחוזק סיסמאות, תוקף ותדירות החלפה. מדיניות חזקה כוללת אורך מינימלי, שילוב תווים ומניעת שימוש חוזר בסיסמאות.',
      imageUrl: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800',
      isNew: false,
      order: 1
    },
    {
      id: '21',
      topicId: '4',
      title: 'אימות דו-שלבי',
      content: 'הפעל אימות דו-שלבי לחשבונות רגישים כדי להגביר את האבטחה. האימות יכול להתבצע באמצעות SMS, אפליקציה או מפתח פיזי.',
      imageUrl: 'https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg?auto=compress&cs=tinysrgb&w=800',
      isNew: true,
      order: 2
    },
    {
      id: '22',
      topicId: '4',
      title: 'ניטור פעילות חשודה',
      content: 'עקוב אחר ניסיונות התחברות חשודים ופעילות חריגה במערכת. המערכת תתריע על פעילות חשודה ותאפשר חסימה אוטומטית.',
      imageUrl: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
      isNew: false,
      order: 3
    },
    {
      id: '23',
      topicId: '4',
      title: 'הגדרת הרשאות ברמת קבוצה',
      content: 'צור קבוצות משתמשים והגדר הרשאות ברמת הקבוצה לניהול יעיל יותר. זה מקל על ניהול הרשאות למספר רב של משתמשים.',
      imageUrl: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800',
      isNew: true,
      order: 4
    },

    // נושא 5: גיבוי ושחזור - 3 טיפים
    {
      id: '24',
      topicId: '5',
      title: 'הגדרת גיבוי אוטומטי',
      content: 'הגדר גיבוי אוטומטי יומי או שבועי כדי להגן על הנתונים שלך. הגיבוי יכלול את כל הנתונים, ההגדרות והקבצים החשובים.',
      imageUrl: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
      isNew: false,
      order: 1
    },
    {
      id: '25',
      topicId: '5',
      title: 'שחזור מגיבוי',
      content: 'למד כיצד לשחזר נתונים מגיבוי במקרה של תקלה או אובדן מידע. התהליך כולל בחירת נקודת השחזור והחזרת הנתונים למצב הרצוי.',
      imageUrl: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800',
      isNew: true,
      order: 2
    },
    {
      id: '26',
      topicId: '5',
      title: 'בדיקת תקינות גיבויים',
      content: 'בדוק באופן קבוע את תקינות הגיבויים כדי לוודא שניתן לשחזר מהם. מומלץ לבצע בדיקה חודשית ולתעד את התוצאות.',
      imageUrl: 'https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg?auto=compress&cs=tinysrgb&w=800',
      isNew: false,
      order: 3
    }
  ];

  // חישוב אוטומטי של מספר הטיפים לכל נושא
  private get mockTopics(): Topic[] {
    return [
      {
        id: '1',
        title: 'ניהול משתמשים',
        isNew: true,
        tipCount: this.mockTips.filter(tip => tip.topicId === '1').length,
        icon: '👥'
      },
      {
        id: '2',
        title: 'דוחות ואנליטיקה',
        isNew: false,
        tipCount: this.mockTips.filter(tip => tip.topicId === '2').length,
        icon: '📊'
      },
      {
        id: '3',
        title: 'הגדרות מערכת',
        isNew: true,
        tipCount: this.mockTips.filter(tip => tip.topicId === '3').length,
        icon: '⚙️'
      },
      {
        id: '4',
        title: 'אבטחה והרשאות',
        isNew: false,
        tipCount: this.mockTips.filter(tip => tip.topicId === '4').length,
        icon: '🔒'
      },
      {
        id: '5',
        title: 'גיבוי ושחזור',
        isNew: false,
        tipCount: this.mockTips.filter(tip => tip.topicId === '5').length,
        icon: '💾'
      }
    ];
  }

  constructor() {
    // סימולציה של טיפים שנקראו (לדוגמה)
    this.markTipAsRead('1');
    this.markTipAsRead('6');
    this.markTipAsRead('14');
  }

  loadTopics(): Observable<Topic[]> {
    this.updateState({ loading: true });
    
    return of(this.mockTopics).pipe(
      delay(300),
      map(topics => {
        this.updateState({ 
          topics,
          loading: false
        });
        return topics;
      })
    );
  }

  searchTopics(query: string): Observable<Topic[]> {
    this.updateState({ searchQuery: query, loading: true });
    
    if (query.trim() === '') {
      return this.loadTopics();
    }

    const searchTerm = query.toLowerCase();
    
    // חיפוש בכותרות הנושאים
    const matchingTopics = this.mockTopics.filter(topic =>
      topic.title.toLowerCase().includes(searchTerm)
    );

    // חיפוש בתוכן הטיפים
    const matchingTips = this.mockTips.filter(tip =>
      tip.title.toLowerCase().includes(searchTerm) ||
      tip.content.toLowerCase().includes(searchTerm)
    );

    // יצירת רשימת נושאים שמכילים טיפים רלוונטיים
    const topicsWithMatchingTips = matchingTips.map(tip => tip.topicId);
    const uniqueTopicIds = [...new Set(topicsWithMatchingTips)];
    
    const topicsFromTips = this.mockTopics.filter(topic =>
      uniqueTopicIds.includes(topic.id) && 
      !matchingTopics.some(mt => mt.id === topic.id)
    );

    // שילוב התוצאות
    const allMatchingTopics = [...matchingTopics, ...topicsFromTips];
    
    return of(allMatchingTopics).pipe(
      delay(200),
      map(topics => {
        this.updateState({ 
          topics,
          loading: false
        });
        return topics;
      })
    );
  }

  // חיפוש ספציפי בטיפים
  searchTips(query: string): Observable<Tip[]> {
    this.updateState({ searchQuery: query, loading: true });
    
    if (query.trim() === '') {
      return of([]);
    }

    const searchTerm = query.toLowerCase();
    
    const matchingTips = this.mockTips.filter(tip =>
      tip.title.toLowerCase().includes(searchTerm) ||
      tip.content.toLowerCase().includes(searchTerm)
    ).map(tip => ({
      ...tip,
      isRead: this.state.value.readTips.has(tip.id)
    }));

    return of(matchingTips).pipe(
      delay(200),
      map(tips => {
        this.updateState({ 
          currentTips: tips,
          currentTopic: undefined, // אין נושא ספציפי כשמחפשים בכל הטיפים
          currentTipIndex: 0,
          loading: false
        });
        return tips;
      })
    );
  }

  loadTipsForTopic(topicId: string): Observable<Tip[]> {
    this.updateState({ loading: true });
    
    const tips = this.mockTips
      .filter(tip => tip.topicId === topicId)
      .sort((a, b) => a.order - b.order)
      .map(tip => ({
        ...tip,
        isRead: this.state.value.readTips.has(tip.id)
      }));
    
    const topic = this.mockTopics.find(t => t.id === topicId);
    
    return of(tips).pipe(
      delay(300),
      map(tips => {
        this.updateState({ 
          currentTips: tips,
          currentTopic: topic,
          currentTipIndex: 0,
          loading: false
        });
        return tips;
      })
    );
  }

  setCurrentTipIndex(index: number): void {
    this.updateState({ currentTipIndex: index });
  }

  nextTip(): void {
    const currentState = this.state.value;
    const newIndex = Math.min(
      currentState.currentTipIndex + 1,
      currentState.currentTips.length - 1
    );
    this.updateState({ currentTipIndex: newIndex });
  }

  previousTip(): void {
    const currentState = this.state.value;
    const newIndex = Math.max(currentState.currentTipIndex - 1, 0);
    this.updateState({ currentTipIndex: newIndex });
  }

  markTipAsRead(tipId: string): void {
    const currentState = this.state.value;
    const newReadTips = new Set(currentState.readTips);
    newReadTips.add(tipId);
    
    // עדכון הטיפים הנוכחיים עם סטטוס הקריאה החדש
    const updatedTips = currentState.currentTips.map(tip => ({
      ...tip,
      isRead: newReadTips.has(tip.id)
    }));
    
    this.updateState({ 
      readTips: newReadTips,
      currentTips: updatedTips
    });
  }

  markTipAsHelpful(tipId: string): void {
    // סימון הטיפ כמועיל
    console.log(`Tip ${tipId} marked as helpful`);
    // כאן ניתן להוסיף לוגיקה לשמירת המידע
  }

  saveFeedback(tipId: string, isPositive: boolean): void {
    // שמירת משוב על הטיפ
    console.log(`Feedback for tip ${tipId}: ${isPositive ? 'positive' : 'negative'}`);
    // כאן ניתן להוסיף לוגיקה לשמירת המשוב במסד נתונים
  }

  private updateState(partialState: Partial<TutorialState>): void {
    this.state.next({ ...this.state.value, ...partialState });
  }
}