// Crime Reports Service - Individual crime cases for each state
export interface CrimeReport {
  id: string;
  caseNumber: string;
  title: string;
  crimeType: 'Financial Fraud' | 'Online Fraud' | 'Identity Theft' | 'Phishing' | 'Cyberbullying' | 'Data Breach' | 'Ransomware' | 'UPI Fraud' | 'Social Media Fraud';
  description: string;
  dateReported: string;
  location: string;
  district: string;
  amount: number; // loss amount in rupees
  victimAge: number;
  victimGender: 'Male' | 'Female' | 'Other';
  status: 'Under Investigation' | 'FIR Filed' | 'Arrest Made' | 'Case Closed' | 'Court Proceedings';
  officerInCharge: string;
  contactNumber: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  modus: string; // How the crime was committed
  preventionTip: string;
  lastUpdate: string;
}

export interface StateCrimeReports {
  stateCode: string;
  stateName: string;
  totalReports: number;
  recentReports: CrimeReport[];
  lastUpdated: string;
}

// Sample crime reports data for Indian states
export const crimeReportsData: StateCrimeReports[] = [
  {
    stateCode: 'DL',
    stateName: 'Delhi',
    totalReports: 1247,
    lastUpdated: '2 minutes ago',
    recentReports: [
      {
        id: 'DL001',
        caseNumber: 'FIR/2024/DL/12847',
        title: 'UPI Transaction Fraud',
        crimeType: 'UPI Fraud',
        description: 'Victim received fake UPI payment request appearing to be from Amazon customer service. Lost ₹45,000 after sharing OTP.',
        dateReported: '2024-01-20',
        location: 'Connaught Place',
        district: 'New Delhi',
        amount: 45000,
        victimAge: 28,
        victimGender: 'Male',
        status: 'Under Investigation',
        officerInCharge: 'Inspector Rajesh Kumar',
        contactNumber: '011-23456789',
        severity: 'High',
        modus: 'Fraudsters called posing as Amazon support, sent fake UPI request link via WhatsApp',
        preventionTip: 'Never share OTP or click on UPI links from unknown sources. Always verify through official channels.',
        lastUpdate: '30 minutes ago'
      },
      {
        id: 'DL002',
        caseNumber: 'FIR/2024/DL/12848',
        title: 'Job Portal Scam',
        crimeType: 'Online Fraud',
        description: 'Fake job offer for work-from-home position demanding ₹25,000 registration fee. Company details were fabricated.',
        dateReported: '2024-01-19',
        location: 'Rohini',
        district: 'North West Delhi',
        amount: 25000,
        victimAge: 24,
        victimGender: 'Female',
        status: 'FIR Filed',
        officerInCharge: 'Sub-Inspector Priya Sharma',
        contactNumber: '011-23456790',
        severity: 'Medium',
        modus: 'Posted fake job on Naukri.com, conducted fake interviews, demanded registration fee',
        preventionTip: 'Legitimate companies never ask for money upfront. Verify company credentials independently.',
        lastUpdate: '2 hours ago'
      },
      {
        id: 'DL003',
        caseNumber: 'FIR/2024/DL/12849',
        title: 'Investment App Fraud',
        crimeType: 'Financial Fraud',
        description: 'Victim invested ₹1,20,000 in fake cryptocurrency trading app promising 30% daily returns. App disappeared after 15 days.',
        dateReported: '2024-01-18',
        location: 'Lajpat Nagar',
        district: 'South Delhi',
        amount: 120000,
        victimAge: 35,
        victimGender: 'Male',
        status: 'Arrest Made',
        officerInCharge: 'Assistant Commissioner Vikram Singh',
        contactNumber: '011-23456791',
        severity: 'Critical',
        modus: 'Fake trading app with AI-generated testimonials, initially allowed small withdrawals to build trust',
        preventionTip: 'Be extremely wary of get-rich-quick schemes. Research investments thoroughly.',
        lastUpdate: '4 hours ago'
      },
      {
        id: 'DL004',
        caseNumber: 'FIR/2024/DL/12850',
        title: 'Dating App Romance Scam',
        crimeType: 'Social Media Fraud',
        description: 'Victim formed online relationship, sent ₹80,000 for fake medical emergency. Profile used stolen photos.',
        dateReported: '2024-01-17',
        location: 'Karol Bagh',
        district: 'Central Delhi',
        amount: 80000,
        victimAge: 31,
        victimGender: 'Female',
        status: 'Under Investigation',
        officerInCharge: 'Inspector Meera Gupta',
        contactNumber: '011-23456792',
        severity: 'High',
        modus: 'Used stolen photos to create fake profile, built emotional connection over 3 months',
        preventionTip: 'Never send money to online contacts. Verify identity through video calls.',
        lastUpdate: '6 hours ago'
      },
      {
        id: 'DL005',
        caseNumber: 'FIR/2024/DL/12851',
        title: 'Rental Property Scam',
        crimeType: 'Online Fraud',
        description: 'Fraudulent property listing on housing website. Victim paid ₹50,000 advance for non-existent apartment.',
        dateReported: '2024-01-16',
        location: 'Dwarka',
        district: 'South West Delhi',
        amount: 50000,
        victimAge: 26,
        victimGender: 'Male',
        status: 'Case Closed',
        officerInCharge: 'Inspector Anil Sharma',
        contactNumber: '011-23456793',
        severity: 'Medium',
        modus: 'Posted fake property photos, demanded advance without physical viewing',
        preventionTip: 'Always visit property physically and verify owner documents before payment.',
        lastUpdate: '8 hours ago'
      }
    ]
  },
  {
    stateCode: 'MH',
    stateName: 'Maharashtra',
    totalReports: 2156,
    lastUpdated: '5 minutes ago',
    recentReports: [
      {
        id: 'MH001',
        caseNumber: 'FIR/2024/MH/34567',
        title: 'Credit Card Cloning',
        crimeType: 'Financial Fraud',
        description: 'Victim\'s credit card was cloned at ATM. Unauthorized transactions worth ₹75,000 made in different cities.',
        dateReported: '2024-01-20',
        location: 'Andheri East',
        district: 'Mumbai Suburban',
        amount: 75000,
        victimAge: 42,
        victimGender: 'Male',
        status: 'Under Investigation',
        officerInCharge: 'PI Suresh Patil',
        contactNumber: '022-26789012',
        severity: 'High',
        modus: 'Skimming device installed on ATM machine, PIN captured via hidden camera',
        preventionTip: 'Cover PIN while entering, check for unusual devices on ATM',
        lastUpdate: '1 hour ago'
      },
      {
        id: 'MH002',
        caseNumber: 'FIR/2024/MH/34568',
        title: 'Business Email Compromise',
        crimeType: 'Online Fraud',
        description: 'Company email hacked, fraudulent payment instructions sent to vendors. Total loss ₹15,00,000.',
        dateReported: '2024-01-19',
        location: 'Bandra Kurla Complex',
        district: 'Mumbai City',
        amount: 1500000,
        victimAge: 38,
        victimGender: 'Male',
        status: 'FIR Filed',
        officerInCharge: 'ACP Pradeep Kulkarni',
        contactNumber: '022-26789013',
        severity: 'Critical',
        modus: 'Phishing email led to email compromise, payment redirected to fraudster accounts',
        preventionTip: 'Use two-factor authentication, verify payment instructions through alternate channels',
        lastUpdate: '3 hours ago'
      },
      {
        id: 'MH003',
        caseNumber: 'FIR/2024/MH/34569',
        title: 'Loan App Harassment',
        crimeType: 'Cyberbullying',
        description: 'Instant loan app charged 300% interest, threatened victim and family members through calls and messages.',
        dateReported: '2024-01-18',
        location: 'Thane',
        district: 'Thane',
        amount: 35000,
        victimAge: 29,
        victimGender: 'Female',
        status: 'Arrest Made',
        officerInCharge: 'Inspector Kavita Desai',
        contactNumber: '022-26789014',
        severity: 'High',
        modus: 'Predatory lending app with hidden charges, harassment through contact list access',
        preventionTip: 'Avoid instant loan apps, read terms carefully, report harassment immediately',
        lastUpdate: '5 hours ago'
      },
      {
        id: 'MH004',
        caseNumber: 'FIR/2024/MH/34570',
        title: 'Social Media Investment Scam',
        crimeType: 'Social Media Fraud',
        description: 'Fake investment group on Telegram promising stock tips. Victim lost ₹2,50,000 in trading scam.',
        dateReported: '2024-01-17',
        location: 'Pune',
        district: 'Pune',
        amount: 250000,
        victimAge: 33,
        victimGender: 'Male',
        status: 'Court Proceedings',
        officerInCharge: 'PI Rajesh Jadhav',
        contactNumber: '020-26789015',
        severity: 'Critical',
        modus: 'Fake trading experts on Telegram provided losing trades, collected fees upfront',
        preventionTip: 'Verify credentials of investment advisors with SEBI, avoid Telegram trading groups',
        lastUpdate: '7 hours ago'
      },
      {
        id: 'MH005',
        caseNumber: 'FIR/2024/MH/34571',
        title: 'Insurance Premium Fraud',
        crimeType: 'Financial Fraud',
        description: 'Fake insurance agent collected ₹1,80,000 as premium for non-existent life insurance policy.',
        dateReported: '2024-01-16',
        location: 'Nashik',
        district: 'Nashik',
        amount: 180000,
        victimAge: 45,
        victimGender: 'Female',
        status: 'Under Investigation',
        officerInCharge: 'Inspector Deepak Raut',
        contactNumber: '0253-2678901',
        severity: 'High',
        modus: 'Posed as agent of reputed insurance company, provided fake policy documents',
        preventionTip: 'Verify agent credentials on insurance company website, demand official receipts',
        lastUpdate: '9 hours ago'
      }
    ]
  },
  {
    stateCode: 'KA',
    stateName: 'Karnataka',
    totalReports: 1876,
    lastUpdated: '3 minutes ago',
    recentReports: [
      {
        id: 'KA001',
        caseNumber: 'FIR/2024/KA/45678',
        title: 'Tech Support Scam',
        crimeType: 'Online Fraud',
        description: 'Fake Microsoft support call, victim given remote access. Bank account emptied of ₹95,000.',
        dateReported: '2024-01-20',
        location: 'Whitefield',
        district: 'Bengaluru Urban',
        amount: 95000,
        victimAge: 52,
        victimGender: 'Male',
        status: 'Under Investigation',
        officerInCharge: 'Inspector Ramesh Naik',
        contactNumber: '080-22334455',
        severity: 'Critical',
        modus: 'Cold called claiming virus on computer, installed remote access software',
        preventionTip: 'Microsoft never calls customers directly. Hang up on unsolicited tech support calls',
        lastUpdate: '45 minutes ago'
      },
      {
        id: 'KA002',
        caseNumber: 'FIR/2024/KA/45679',
        title: 'Cryptocurrency Ponzi Scheme',
        crimeType: 'Financial Fraud',
        description: 'Fake crypto trading platform promised 50% monthly returns. Platform disappeared with ₹8,50,000.',
        dateReported: '2024-01-19',
        location: 'Koramangala',
        district: 'Bengaluru Urban',
        amount: 850000,
        victimAge: 28,
        victimGender: 'Male',
        status: 'FIR Filed',
        officerInCharge: 'ACP Sunitha Reddy',
        contactNumber: '080-22334456',
        severity: 'Critical',
        modus: 'Professional website with fake testimonials, initially paid some investors to build trust',
        preventionTip: 'No legitimate investment guarantees such high returns. Research thoroughly before investing',
        lastUpdate: '2 hours ago'
      },
      {
        id: 'KA003',
        caseNumber: 'FIR/2024/KA/45680',
        title: 'E-commerce Fake Website',
        crimeType: 'Online Fraud',
        description: 'Fake electronics website during Diwali sale. Collected ₹65,000 for laptops that were never delivered.',
        dateReported: '2024-01-18',
        location: 'Marathahalli',
        district: 'Bengaluru Urban',
        amount: 65000,
        victimAge: 25,
        victimGender: 'Female',
        status: 'Arrest Made',
        officerInCharge: 'Inspector Manjunath B',
        contactNumber: '080-22334457',
        severity: 'Medium',
        modus: 'Created professional-looking website, offered huge discounts during festival season',
        preventionTip: 'Shop only on verified e-commerce sites, check seller ratings and reviews',
        lastUpdate: '4 hours ago'
      },
      {
        id: 'KA004',
        caseNumber: 'FIR/2024/KA/45681',
        title: 'Gaming Tournament Fraud',
        crimeType: 'Online Fraud',
        description: 'Fake PUBG tournament entry fee scam. Collected ₹15,000 from multiple gamers with no tournament held.',
        dateReported: '2024-01-17',
        location: 'Electronic City',
        district: 'Bengaluru Urban',
        amount: 15000,
        victimAge: 19,
        victimGender: 'Male',
        status: 'Case Closed',
        officerInCharge: 'Inspector Priya Kumari',
        contactNumber: '080-22334458',
        severity: 'Low',
        modus: 'Created fake gaming tournament page, collected entry fees via UPI',
        preventionTip: 'Verify tournament organizers, pay only through official gaming platforms',
        lastUpdate: '6 hours ago'
      },
      {
        id: 'KA005',
        caseNumber: 'FIR/2024/KA/45682',
        title: 'Digital Loan Fraud',
        crimeType: 'Financial Fraud',
        description: 'Fake loan approval, demanded processing fee of ₹45,000. No loan was disbursed after payment.',
        dateReported: '2024-01-16',
        location: 'HSR Layout',
        district: 'Bengaluru Urban',
        amount: 45000,
        victimAge: 32,
        victimGender: 'Male',
        status: 'Under Investigation',
        officerInCharge: 'Inspector Ravi Kumar',
        contactNumber: '080-22334459',
        severity: 'Medium',
        modus: 'Sent fake loan approval letter, demanded processing fee before disbursement',
        preventionTip: 'Legitimate lenders deduct fees from loan amount, never ask for upfront payment',
        lastUpdate: '8 hours ago'
      }
    ]
  },
  {
    stateCode: 'UP',
    stateName: 'Uttar Pradesh',
    totalReports: 2987,
    lastUpdated: '7 minutes ago',
    recentReports: [
      {
        id: 'UP001',
        caseNumber: 'FIR/2024/UP/67890',
        title: 'Fake Government Scheme',
        crimeType: 'Online Fraud',
        description: 'Fraudsters posed as government officials offering fake PM Kisan benefits. Collected ₹25,000 as processing fee.',
        dateReported: '2024-01-20',
        location: 'Gomti Nagar',
        district: 'Lucknow',
        amount: 25000,
        victimAge: 48,
        victimGender: 'Male',
        status: 'Under Investigation',
        officerInCharge: 'Inspector Vijay Singh',
        contactNumber: '0522-2789012',
        severity: 'High',
        modus: 'Called posing as PM Kisan officials, sent fake documents via WhatsApp',
        preventionTip: 'Government schemes are free. Verify through official websites or local offices',
        lastUpdate: '2 hours ago'
      },
      {
        id: 'UP002',
        caseNumber: 'FIR/2024/UP/67891',
        title: 'Mobile Recharge Fraud',
        crimeType: 'Online Fraud',
        description: 'Fake mobile recharge website offering 90% cashback. Victim lost ₹18,000 in multiple fake recharges.',
        dateReported: '2024-01-19',
        location: 'Varanasi',
        district: 'Varanasi',
        amount: 18000,
        victimAge: 35,
        victimGender: 'Male',
        status: 'FIR Filed',
        officerInCharge: 'Inspector Shyam Babu',
        contactNumber: '0542-2789013',
        severity: 'Medium',
        modus: 'Created fake recharge website with attractive cashback offers',
        preventionTip: 'Use only official mobile operator websites or authorized retailers',
        lastUpdate: '4 hours ago'
      },
      {
        id: 'UP003',
        caseNumber: 'FIR/2024/UP/67892',
        title: 'Bank Account Fraud',
        crimeType: 'Phishing',
        description: 'Fake bank employee called asking for account details to "update KYC". ₹1,25,000 transferred out.',
        dateReported: '2024-01-18',
        location: 'Kanpur',
        district: 'Kanpur Nagar',
        amount: 125000,
        victimAge: 58,
        victimGender: 'Female',
        status: 'Arrest Made',
        officerInCharge: 'Inspector Reena Sharma',
        contactNumber: '0512-2789014',
        severity: 'Critical',
        modus: 'Spoofed bank phone number, convinced victim to share account details and OTP',
        preventionTip: 'Banks never ask for account details over phone. Visit branch for any KYC updates',
        lastUpdate: '6 hours ago'
      },
      {
        id: 'UP004',
        caseNumber: 'FIR/2024/UP/67893',
        title: 'Lottery Scam',
        crimeType: 'Online Fraud',
        description: 'Fake lottery winning message claiming ₹25 lakh prize. Victim paid ₹55,000 as processing charges.',
        dateReported: '2024-01-17',
        location: 'Agra',
        district: 'Agra',
        amount: 55000,
        victimAge: 41,
        victimGender: 'Male',
        status: 'Case Closed',
        officerInCharge: 'Inspector Deepak Yadav',
        contactNumber: '0562-2789015',
        severity: 'High',
        modus: 'Sent fake lottery winning certificate, demanded taxes and processing fees',
        preventionTip: 'You cannot win a lottery you never entered. Ignore such messages',
        lastUpdate: '8 hours ago'
      },
      {
        id: 'UP005',
        caseNumber: 'FIR/2024/UP/67894',
        title: 'Job Guarantee Scam',
        crimeType: 'Online Fraud',
        description: 'Fake government job offer in UP Police. Collected ₹2,80,000 as examination and joining fee.',
        dateReported: '2024-01-16',
        location: 'Allahabad',
        district: 'Prayagraj',
        amount: 280000,
        victimAge: 24,
        victimGender: 'Male',
        status: 'Under Investigation',
        officerInCharge: 'Inspector Manoj Tiwari',
        contactNumber: '0532-2789016',
        severity: 'Critical',
        modus: 'Created fake recruitment notifications, conducted fake interviews',
        preventionTip: 'Government job applications are through official channels only. No fees required',
        lastUpdate: '10 hours ago'
      }
    ]
  }
];

// Service class for managing crime reports
export class CrimeReportsService {
  private static instance: CrimeReportsService;
  private reportsData: StateCrimeReports[];

  constructor() {
    this.reportsData = [...crimeReportsData];
  }

  static getInstance(): CrimeReportsService {
    if (!CrimeReportsService.instance) {
      CrimeReportsService.instance = new CrimeReportsService();
    }
    return CrimeReportsService.instance;
  }

  // Get crime reports for a specific state
  getStateReports(stateCode: string): StateCrimeReports | undefined {
    return this.reportsData.find(state => state.stateCode === stateCode);
  }

  // Get all states reports
  getAllStateReports(): StateCrimeReports[] {
    return [...this.reportsData];
  }

  // Get recent reports across all states
  getRecentReports(limit: number = 10): CrimeReport[] {
    const allReports: CrimeReport[] = [];
    this.reportsData.forEach(state => {
      allReports.push(...state.recentReports);
    });
    
    // Sort by date and return most recent
    return allReports
      .sort((a, b) => new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime())
      .slice(0, limit);
  }

  // Get reports by crime type
  getReportsByCrimeType(crimeType: string): CrimeReport[] {
    const allReports: CrimeReport[] = [];
    this.reportsData.forEach(state => {
      allReports.push(...state.recentReports.filter(report => report.crimeType === crimeType));
    });
    return allReports;
  }

  // Get high value fraud cases
  getHighValueFrauds(minAmount: number = 100000): CrimeReport[] {
    const allReports: CrimeReport[] = [];
    this.reportsData.forEach(state => {
      allReports.push(...state.recentReports.filter(report => report.amount >= minAmount));
    });
    return allReports.sort((a, b) => b.amount - a.amount);
  }

  // Search reports by keywords
  searchReports(keyword: string): CrimeReport[] {
    const allReports: CrimeReport[] = [];
    this.reportsData.forEach(state => {
      allReports.push(...state.recentReports.filter(report => 
        report.title.toLowerCase().includes(keyword.toLowerCase()) ||
        report.description.toLowerCase().includes(keyword.toLowerCase()) ||
        report.modus.toLowerCase().includes(keyword.toLowerCase())
      ));
    });
    return allReports;
  }
}

export default CrimeReportsService;
