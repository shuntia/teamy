'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Users, Eye, AlertTriangle, CheckCircle, Clock, Save, Loader2, Send } from 'lucide-react'
import { QuestionPrompt } from '@/components/tests/question-prompt'

interface ESTestAttemptsViewProps {
  testId: string
  testName: string
  scoresReleased: boolean
  onScoresReleased?: () => void
}

interface Attempt {
  id: string
  membershipId: string
  status: string
  startedAt: string | null
  submittedAt: string | null
  gradeEarned: number | null
  proctoringScore: number | null
  tabSwitchCount: number
  timeOffPageSeconds: number
  user: {
    id: string
    name: string | null
    email: string
  } | null
  club: {
    id: string
    name: string
  } | null
  answers: Array<{
    id: string
    questionId: string
    answerText: string | null
    selectedOptionIds: string[] | null
    numericAnswer: number | null
    pointsAwarded: number | null
    gradedAt: string | null
    graderNote: string | null
    question: {
      id: string
      promptMd: string
      type: string
      points: number
      explanation: string | null
      options: Array<{
        id: string
        label: string
        isCorrect: boolean
      }>
    }
  }>
}

interface GradeEdit {
  answerId: string
  pointsAwarded: number
  graderNote: string
}

export function ESTestAttemptsView({ testId, testName, scoresReleased: initialScoresReleased, onScoresReleased }: ESTestAttemptsViewProps) {
  const { toast } = useToast()
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAttempt, setSelectedAttempt] = useState<Attempt | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [sortBy, setSortBy] = useState<'submission' | 'score'>('submission')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [gradeEdits, setGradeEdits] = useState<Record<string, GradeEdit>>({})
  const [saving, setSaving] = useState(false)
  const [scoresReleased, setScoresReleased] = useState(initialScoresReleased)
  const [releasingScores, setReleasingScores] = useState(false)

  useEffect(() => {
    fetchAttempts()
  }, [testId])

  const fetchAttempts = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/es/tests/${testId}/attempts`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch attempts`)
      }
      const data = await response.json()
      setAttempts(data.attempts || [])
    } catch (error: any) {
      console.error('Failed to fetch attempts:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to load test attempts',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = async (attempt: Attempt) => {
    setSelectedAttempt(attempt)
    setDetailDialogOpen(true)
    // Initialize grade edits from current attempt
    const edits: Record<string, GradeEdit> = {}
    attempt.answers.forEach((answer) => {
      edits[answer.id] = {
        answerId: answer.id,
        pointsAwarded: answer.pointsAwarded !== null ? answer.pointsAwarded : 0,
        graderNote: answer.graderNote || '',
      }
    })
    setGradeEdits(edits)
  }

  const handleGradeEdit = (answerId: string, field: 'pointsAwarded' | 'graderNote', value: number | string) => {
    setGradeEdits((prev) => ({
      ...prev,
      [answerId]: {
        ...prev[answerId],
        [field]: value,
      },
    }))
  }

  const handleSaveGrades = async () => {
    if (!selectedAttempt) return

    setSaving(true)
    try {
      // Only send grades that have changed or need grading
      const gradesToSave = Object.values(gradeEdits).filter((grade) => {
        const answer = selectedAttempt.answers.find((a) => a.id === grade.answerId)
        if (!answer) return false
        
        // Include if it is an FRQ that needs grading
        const isFRQ = answer.question.type === 'SHORT_TEXT' || answer.question.type === 'LONG_TEXT'
        return isFRQ
      })

      const response = await fetch(`/api/es/tests/${testId}/attempts/${selectedAttempt.id}/grade`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grades: gradesToSave }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to save grades')
      }

      toast({
        title: 'Success',
        description: 'Grades saved successfully',
      })

      // Refresh attempts to get updated data
      await fetchAttempts()
      setDetailDialogOpen(false)
    } catch (error: any) {
      console.error('Failed to save grades:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to save grades',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleReleaseScores = async () => {
    setReleasingScores(true)
    try {
      const response = await fetch(`/api/es/tests/${testId}/release-scores`, {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || 'Failed to release scores'
        // If it's a 400 error about tournament not ended, show a clearer message
        if (response.status === 400 && errorMessage.includes('tournament has ended')) {
          throw new Error('Scores can only be released after the tournament has ended.')
        }
        throw new Error(errorMessage)
      }

      setScoresReleased(true)
      toast({
        title: 'Success',
        description: 'Scores released successfully',
      })

      if (onScoresReleased) {
        onScoresReleased()
      }
    } catch (error: any) {
      console.error('Failed to release scores:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to release scores',
        variant: 'destructive',
      })
    } finally {
      setReleasingScores(false)
    }
  }

  const calculateGradingStatus = (attempt: Attempt): {
    status: 'UNGRADED' | 'PARTIALLY_GRADED' | 'FULLY_GRADED'
    gradedCount: number
    totalCount: number
  } => {
    const totalCount = attempt.answers.length
    const gradedCount = attempt.answers.filter((a) => a.gradedAt !== null).length

    let status: 'UNGRADED' | 'PARTIALLY_GRADED' | 'FULLY_GRADED'
    if (gradedCount === 0) {
      status = 'UNGRADED'
    } else if (gradedCount === totalCount) {
      status = 'FULLY_GRADED'
    } else {
      status = 'PARTIALLY_GRADED'
    }

    return { status, gradedCount, totalCount }
  }

  const calculateScoreBreakdown = (attempt: Attempt): {
    earnedPoints: number
    gradedTotalPoints: number
    overallTotalPoints: number
  } => {
    let earnedPoints = 0
    let gradedTotalPoints = 0
    let overallTotalPoints = 0

    attempt.answers.forEach((answer) => {
      const questionPoints = answer.question.points
      overallTotalPoints += questionPoints

      if (answer.gradedAt !== null) {
        gradedTotalPoints += questionPoints
        earnedPoints += answer.pointsAwarded || 0
      }
    })

    return { earnedPoints, gradedTotalPoints, overallTotalPoints }
  }

  const getGradingStatusBadge = (status: 'UNGRADED' | 'PARTIALLY_GRADED' | 'FULLY_GRADED') => {
    const config = {
      UNGRADED: { label: 'Ungraded', variant: 'secondary' as const, className: 'bg-gray-500' },
      PARTIALLY_GRADED: { label: 'Partially Graded', variant: 'default' as const, className: 'bg-orange-500' },
      FULLY_GRADED: { label: 'Fully Graded', variant: 'default' as const, className: 'bg-green-600' },
    }
    const { label, variant, className } = config[status]
    return <Badge variant={variant} className={className}>{label}</Badge>
  }

  const calculateTimeTaken = (startedAt: string | null, submittedAt: string | null): string => {
    if (!startedAt || !submittedAt) return 'N/A'
    
    const start = new Date(startedAt).getTime()
    const end = new Date(submittedAt).getTime()
    const diffMs = end - start
    const diffMins = Math.floor(diffMs / 60000)
    const diffSecs = Math.floor((diffMs % 60000) / 1000)
    
    return `${diffMins}m ${diffSecs}s`
  }

  // Sort attempts based on selected criteria
  const sortedAttempts = [...attempts].sort((a, b) => {
    if (sortBy === 'submission') {
      const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0
      const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0
      return sortDirection === 'desc' ? dateB - dateA : dateA - dateB
    } else {
      const scoreA = a.gradeEarned ?? -1
      const scoreB = b.gradeEarned ?? -1
      return sortDirection === 'desc' ? scoreB - scoreA : scoreA - scoreB
    }
  })

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
      NOT_STARTED: { label: 'Not Started', variant: 'secondary' },
      IN_PROGRESS: { label: 'In Progress', variant: 'default' },
      SUBMITTED: { label: 'Submitted', variant: 'default' },
      GRADED: { label: 'Graded', variant: 'default' },
    }
    const { label, variant } = config[status] || { label: status, variant: 'secondary' as const }
    return <Badge variant={variant}>{label}</Badge>
  }

  if (loading) {
    return <div className="p-4">Loading attempts...</div>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Responses ({attempts.length})
              </CardTitle>
              <CardDescription>
                View all student attempts for {testName}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <label htmlFor="sortBy" className="text-sm text-muted-foreground">
                  Sort by:
                </label>
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'submission' | 'score')}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="submission">Submission Date</option>
                  <option value="score">Score</option>
                </select>
              </div>

              {/* Sort Direction Dropdown */}
              <select
                value={sortDirection}
                onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="desc">
                  {sortBy === 'submission' ? 'Newest First' : 'High to Low'}
                </option>
                <option value="asc">
                  {sortBy === 'submission' ? 'Oldest First' : 'Low to High'}
                </option>
              </select>

              {!scoresReleased && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleReleaseScores}
                  disabled={releasingScores}
                  className="gap-2"
                >
                  {releasingScores ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Releasing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Release Scores
                    </>
                  )}
                </Button>
              )}
              {scoresReleased && (
                <Badge variant="default" className="bg-green-600">
                  Scores Released
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {attempts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No attempts yet
            </p>
          ) : (
            <div className="space-y-3">
              {sortedAttempts.map((attempt) => (
                <Card key={attempt.id} className="border-border">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {attempt.user?.name || attempt.user?.email || 'Unknown User'}
                          </p>
                          {attempt.club && (
                            <Badge variant="outline" className="text-xs">
                              {attempt.club.name}
                            </Badge>
                          )}
                          {getStatusBadge(attempt.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-muted-foreground">
                          {attempt.gradeEarned !== null && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Score:</span>
                              <span>{(() => {
                                const breakdown = calculateScoreBreakdown(attempt)
                                return `${breakdown.earnedPoints.toFixed(1)} / ${breakdown.gradedTotalPoints.toFixed(1)} pts`
                              })()}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            {getGradingStatusBadge(calculateGradingStatus(attempt).status)}
                          </div>
                          {attempt.submittedAt && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {new Date(attempt.submittedAt).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          <div className={`flex items-center gap-1 ${attempt.tabSwitchCount > 0 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                            {attempt.tabSwitchCount > 0 && <AlertTriangle className="h-3 w-3" />}
                            <span>{attempt.tabSwitchCount} tab switch{attempt.tabSwitchCount !== 1 ? 'es' : ''}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(attempt)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Attempt Details</DialogTitle>
            <DialogDescription>
              {selectedAttempt?.user?.name || selectedAttempt?.user?.email || 'Unknown User'}
              {selectedAttempt?.club && ` - ${selectedAttempt.club.name}`}
            </DialogDescription>
          </DialogHeader>

          {selectedAttempt && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedAttempt.status)}</div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Grading Status</p>
                  <div className="mt-1">{getGradingStatusBadge(calculateGradingStatus(selectedAttempt).status)}</div>
                </div>
                {selectedAttempt.gradeEarned !== null && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Score</p>
                    <p className="text-lg font-semibold">
                      {(() => {
                        const breakdown = calculateScoreBreakdown(selectedAttempt)
                        return `${breakdown.earnedPoints.toFixed(1)} / ${breakdown.gradedTotalPoints.toFixed(1)} pts`
                      })()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Time Taken</p>
                  <p className="text-lg font-semibold">
                    {calculateTimeTaken(selectedAttempt.startedAt, selectedAttempt.submittedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Tab Switches</p>
                  <p className={`text-lg font-semibold ${selectedAttempt.tabSwitchCount > 0 ? 'text-orange-600' : ''}`}>
                    {selectedAttempt.tabSwitchCount}
                  </p>
                </div>
                {selectedAttempt.submittedAt && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Submitted</p>
                    <p className="text-sm">{new Date(selectedAttempt.submittedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>

              {/* Answers */}
              <div className="space-y-4">
                <h3 className="font-semibold">Answers</h3>
                {selectedAttempt.answers.map((answer, index) => {
                  const isFRQ = answer.question.type === 'SHORT_TEXT' || answer.question.type === 'LONG_TEXT'
                  const gradeEdit = gradeEdits[answer.id]
                  
                  return (
                    <Card key={answer.id} className="border-border">
                      <CardContent className="pt-4">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">Question {index + 1}</Badge>
                                <Badge variant="secondary">
                                  {answer.question.points} pts
                                </Badge>
                                {answer.gradedAt && (
                                  <Badge variant="default" className="bg-green-600">
                                    Graded
                                  </Badge>
                                )}
                              </div>
                              <QuestionPrompt promptMd={answer.question.promptMd} />
                            </div>
                          </div>

                          {/* Answer Display */}
                          <div className="space-y-2">
                            <Label>Student Answer</Label>
                            {answer.question.type === 'MCQ_SINGLE' || answer.question.type === 'MCQ_MULTI' ? (
                              <div className="space-y-2">
                                {answer.question.options.map((option) => {
                                  const isSelected = answer.selectedOptionIds?.includes(option.id)
                                  return (
                                    <div
                                      key={option.id}
                                      className={`p-2 rounded border ${
                                        isSelected
                                          ? option.isCorrect
                                            ? 'bg-green-100 border-green-500 dark:bg-green-900/20 dark:border-green-500'
                                            : 'bg-red-100 border-red-500 dark:bg-red-900/20 dark:border-red-500'
                                          : option.isCorrect
                                          ? 'bg-green-50 border-green-300 dark:bg-green-900/10 dark:border-green-700'
                                          : 'bg-muted border-border'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        {isSelected && <CheckCircle className="h-4 w-4" />}
                                        {option.isCorrect && !isSelected && (
                                          <CheckCircle className="h-4 w-4 text-green-600" />
                                        )}
                                        <span>{option.label}</span>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            ) : answer.question.type === 'NUMERIC' ? (
                              <div className="p-3 bg-muted rounded">
                                <p className="font-mono">
                                  {answer.numericAnswer !== null
                                    ? answer.numericAnswer.toString()
                                    : 'No answer'}
                                </p>
                                {answer.question.explanation && (
                                  <p className="text-sm text-muted-foreground mt-2">
                                    Correct answer: {answer.question.explanation}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="p-3 bg-muted rounded">
                                <p className="whitespace-pre-wrap">
                                  {answer.answerText || 'No answer'}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Grading Section for FRQs */}
                          {isFRQ && (
                            <div className="space-y-2 pt-2 border-t">
                              <Label>Grading</Label>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor={`points-${answer.id}`}>Points Awarded</Label>
                                  <Input
                                    id={`points-${answer.id}`}
                                    type="number"
                                    min="0"
                                    max={answer.question.points}
                                    step="0.1"
                                    value={gradeEdit?.pointsAwarded ?? answer.pointsAwarded ?? 0}
                                    onChange={(e) =>
                                      handleGradeEdit(
                                        answer.id,
                                        'pointsAwarded',
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Max: {answer.question.points} pts
                                  </p>
                                </div>
                                <div>
                                  <Label htmlFor={`note-${answer.id}`}>Grader Note</Label>
                                  <Textarea
                                    id={`note-${answer.id}`}
                                    value={gradeEdit?.graderNote ?? answer.graderNote ?? ''}
                                    onChange={(e) =>
                                      handleGradeEdit(answer.id, 'graderNote', e.target.value)
                                    }
                                    rows={3}
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Show points for non-FRQs */}
                          {!isFRQ && answer.pointsAwarded !== null && (
                            <div className="pt-2 border-t">
                              <p className="text-sm">
                                <span className="font-medium">Points:</span>{' '}
                                {answer.pointsAwarded} / {answer.question.points}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Save Button */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={handleSaveGrades} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Grades
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
