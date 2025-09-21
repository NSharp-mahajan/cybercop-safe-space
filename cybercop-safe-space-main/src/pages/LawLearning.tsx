import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  Play, 
  RotateCcw,
  Award,
  Zap,
  Target,
  Brain
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const LawLearning = () => {
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [userLevel, setUserLevel] = useState(1);
  const [userXP, setUserXP] = useState(150);

  const quizzes = [
    {
      id: 1,
      title: "Cyber Crime Basics",
      difficulty: "Beginner",
      xp: 50,
      description: "Learn fundamental concepts of cybercrime laws",
      icon: BookOpen,
      questions: [
        {
          question: "What is the primary law governing cybercrime in India?",
          options: [
            "Indian Penal Code",
            "Information Technology Act, 2000",
            "Companies Act, 2013",
            "Copyright Act, 1957"
          ],
          correct: 1,
          explanation: "The Information Technology Act, 2000 is the primary legislation dealing with cybercrime in India."
        },
        {
          question: "Which section of IT Act deals with unauthorized access to computer systems?",
          options: [
            "Section 43",
            "Section 66",
            "Section 67",
            "Section 72"
          ],
          correct: 0,
          explanation: "Section 43 of the IT Act deals with penalty for damage to computer systems and unauthorized access."
        },
        {
          question: "Maximum punishment for identity theft under IT Act is:",
          options: [
            "1 year imprisonment",
            "2 years imprisonment",
            "3 years imprisonment",
            "5 years imprisonment"
          ],
          correct: 2,
          explanation: "Identity theft under Section 66C can be punished with imprisonment up to 3 years and fine up to ₹1 lakh."
        }
      ]
    },
    {
      id: 2,
      title: "Digital Evidence Laws",
      difficulty: "Intermediate",
      xp: 75,
      description: "Understanding legal aspects of digital evidence",
      icon: Target,
      questions: [
        {
          question: "Under which section are electronic records admissible as evidence?",
          options: [
            "Section 65A",
            "Section 65B",
            "Section 66A",
            "Section 67A"
          ],
          correct: 1,
          explanation: "Section 65B of the Indian Evidence Act makes electronic records admissible as evidence with proper certification."
        },
        {
          question: "What is required for electronic evidence to be admissible in court?",
          options: [
            "Only printout",
            "Digital signature",
            "Certificate under Section 65B",
            "Witness testimony"
          ],
          correct: 2,
          explanation: "A certificate under Section 65B(4) is mandatory for electronic evidence to be admissible in court."
        },
        {
          question: "Who can issue the certificate for electronic evidence?",
          options: [
            "Any lawyer",
            "Police officer",
            "Person in charge of computer system",
            "Judge only"
          ],
          correct: 2,
          explanation: "The certificate must be issued by a person occupying a responsible official position in relation to the computer system."
        }
      ]
    },
    {
      id: 3,
      title: "Privacy & Data Protection",
      difficulty: "Advanced",
      xp: 100,
      description: "Master advanced concepts of privacy laws",
      icon: Brain,
      questions: [
        {
          question: "Which law governs data protection in India?",
          options: [
            "IT Act 2000",
            "Digital Personal Data Protection Act 2023",
            "RTI Act 2005",
            "Companies Act 2013"
          ],
          correct: 1,
          explanation: "The Digital Personal Data Protection Act, 2023 is the comprehensive data protection law in India."
        },
        {
          question: "What is the penalty for data breach under DPDP Act?",
          options: [
            "₹50 crores",
            "₹150 crores",
            "₹250 crores",
            "₹500 crores"
          ],
          correct: 2,
          explanation: "Under DPDP Act 2023, penalty for data breach can go up to ₹250 crores depending on the severity."
        },
        {
          question: "Age of consent for data processing in India is:",
          options: [
            "16 years",
            "18 years",
            "21 years",
            "No specific age"
          ],
          correct: 1,
          explanation: "Under DPDP Act 2023, the age of consent for data processing is 18 years."
        }
      ]
    }
  ];

  const startQuiz = (quiz: any) => {
    setCurrentQuiz(quiz);
    setCurrentQuestion(0);
    setScore(0);
    setAnswers([]);
    setShowResult(false);
  };

  const handleAnswer = (selectedOption: number) => {
    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);

    if (selectedOption === currentQuiz.questions[currentQuestion].correct) {
      setScore(score + 1);
    }

    if (currentQuestion + 1 < currentQuiz.questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
      // Add XP
      const earnedXP = Math.floor((score + 1) / currentQuiz.questions.length * currentQuiz.xp);
      setUserXP(userXP + earnedXP);
      
      // Level up check
      if (userXP + earnedXP >= userLevel * 200) {
        setUserLevel(userLevel + 1);
      }
    }
  };

  const resetQuiz = () => {
    setCurrentQuiz(null);
    setCurrentQuestion(0);
    setScore(0);
    setAnswers([]);
    setShowResult(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "default";
      case "Intermediate": return "secondary";
      case "Advanced": return "destructive";
      default: return "default";
    }
  };

  if (currentQuiz && !showResult) {
    const question = currentQuiz.questions[currentQuestion];
    return (
      <div className="min-h-screen bg-cyber-grid">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            {/* Quiz Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <Button variant="outline" onClick={resetQuiz} className="transition-glow hover:glow-primary">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Back to Quizzes
                </Button>
                <Badge variant={getDifficultyColor(currentQuiz.difficulty)}>
                  {currentQuiz.difficulty}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold mb-2">{currentQuiz.title}</h1>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Question {currentQuestion + 1} of {currentQuiz.questions.length}
                </span>
                <span className="text-primary font-semibold">Score: {score}</span>
              </div>
              <Progress value={((currentQuestion + 1) / currentQuiz.questions.length) * 100} className="mt-2" />
            </div>

            {/* Question Card */}
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="text-xl">{question.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full text-left justify-start p-4 h-auto transition-glow hover:glow-primary"
                      onClick={() => handleAnswer(index)}
                    >
                      <span className="mr-3 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs">
                        {String.fromCharCode(65 + index)}
                      </span>
                      {option}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (showResult) {
    const percentage = Math.round((score / currentQuiz.questions.length) * 100);
    const earnedXP = Math.floor(percentage / 100 * currentQuiz.xp);
    
    return (
      <div className="min-h-screen bg-cyber-grid">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <Card className="cyber-card text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  {percentage >= 80 ? (
                    <Trophy className="h-16 w-16 text-yellow-500" />
                  ) : percentage >= 60 ? (
                    <Award className="h-16 w-16 text-primary" />
                  ) : (
                    <Target className="h-16 w-16 text-muted-foreground" />
                  )}
                </div>
                <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
                <CardDescription>
                  You scored {score} out of {currentQuiz.questions.length} ({percentage}%)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center gap-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{earnedXP}</div>
                    <div className="text-sm text-muted-foreground">XP Earned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{percentage}%</div>
                    <div className="text-sm text-muted-foreground">Accuracy</div>
                  </div>
                </div>

                {/* Question Review */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Review Answers:</h3>
                  {currentQuiz.questions.map((q: any, index: number) => (
                    <Alert key={index}>
                      <div className="flex items-start gap-2">
                        {answers[index] === q.correct ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <AlertDescription>
                            <strong>Q{index + 1}:</strong> {q.question}
                            <br />
                            <span className="text-green-600">Correct: {q.options[q.correct]}</span>
                            <br />
                            <span className="text-xs text-muted-foreground">{q.explanation}</span>
                          </AlertDescription>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>

                <div className="flex gap-4 justify-center">
                  <Button onClick={resetQuiz} className="transition-glow hover:glow-primary">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Back to Quizzes
                  </Button>
                  <Button onClick={() => startQuiz(currentQuiz)} variant="outline" className="transition-glow hover:glow-primary">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Retake Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-grid">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10 border border-primary/20 glow-primary">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold gradient-primary bg-clip-text text-transparent mb-4">
              Gamified Law Learning
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Master cybersecurity laws through interactive quizzes and earn XP points
            </p>
          </div>

          {/* User Stats */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="cyber-card text-center">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-2">
                  <Award className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="text-2xl font-bold">Level {userLevel}</div>
                <div className="text-sm text-muted-foreground">Current Level</div>
              </CardContent>
            </Card>
            <Card className="cyber-card text-center">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <div className="text-2xl font-bold">{userXP}</div>
                <div className="text-sm text-muted-foreground">Total XP</div>
              </CardContent>
            </Card>
            <Card className="cyber-card text-center">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-8 w-8 text-green-500" />
                </div>
                <div className="text-2xl font-bold">{userLevel * 200 - userXP}</div>
                <div className="text-sm text-muted-foreground">XP to Next Level</div>
              </CardContent>
            </Card>
          </div>

          {/* XP Progress */}
          <Card className="cyber-card mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Level {userLevel} Progress</span>
                <span className="text-sm text-muted-foreground">{userXP}/{userLevel * 200} XP</span>
              </div>
              <Progress value={(userXP % 200) / 2} className="mb-2" />
              <div className="text-xs text-muted-foreground text-center">
                Complete quizzes to earn XP and unlock new levels!
              </div>
            </CardContent>
          </Card>

          {/* Quiz Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => {
              const IconComponent = quiz.icon;
              return (
                <Card key={quiz.id} className="cyber-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-6 w-6 text-primary" />
                        <CardTitle className="text-lg">{quiz.title}</CardTitle>
                      </div>
                      <Badge variant={getDifficultyColor(quiz.difficulty)}>
                        {quiz.difficulty}
                      </Badge>
                    </div>
                    <CardDescription>{quiz.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        {quiz.questions.length} Questions
                      </div>
                      <div className="flex items-center gap-2 text-sm text-primary">
                        <Zap className="h-4 w-4" />
                        {quiz.xp} XP
                      </div>
                    </div>
                    <Button 
                      onClick={() => startQuiz(quiz)}
                      className="w-full transition-glow hover:glow-primary"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Start Quiz
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Learning Tips */}
          <Card className="cyber-card mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Learning Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">📚 Study Strategy:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Start with beginner quizzes to build foundation</li>
                    <li>• Review explanations for wrong answers</li>
                    <li>• Retake quizzes to improve your score</li>
                    <li>• Progress gradually to advanced topics</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">🏆 Gamification:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Earn XP by completing quizzes</li>
                    <li>• Level up to unlock achievements</li>
                    <li>• Higher accuracy = more XP rewards</li>
                    <li>• Track your learning progress</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LawLearning;