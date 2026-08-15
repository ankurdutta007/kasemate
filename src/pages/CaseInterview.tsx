import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { getCaseCompany } from '../data/cases'
import { useCases } from '../context/CasesContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import img12 from '@/imports/image-12.webp'
import img13 from '@/imports/image-13.webp'

// v2, light-mode aware design, slower TTS, improved UX

type CallState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error'
type Phase = 'active' | 'ended'
type Turn = { role: 'interviewer' | 'user'; text: string; turnNum: number }

import { WARMUP_INTROS } from '../lib/warmupIntros'

const RESPONSES = [
  "Interesting, you've identified the revenue side. But before we go further, what specific sub-drivers of revenue are you planning to investigate? Be precise.",
  "That's a reasonable structure. What data would you actually ask me for first, and why that piece before others?",
  "Why that assumption specifically? Walk me through the logic.",
  "You're moving a bit quickly, I want to push back. How confident are you in that segmentation? What would break it?",
  "Good. That narrows it. Now, given that, what's the single most important hypothesis you're testing next?",
  "Let me give you a data point: operating costs are actually down 3%. How does that change your hypothesis?",
  "That's a reasonable approach. If you had to put a number on it right now, what's your rough estimate and how did you arrive at it?",
  "You said 'large market.' What does large mean here, size, growth rate, or something else?",
  "Before you continue, you've assumed the customer segment is homogeneous. Is that a safe assumption?",
  "Strong point. How would you quantify that? Give me a back-of-the-envelope.",
]

const USER_DEMO_PHRASES = [
  "I'd like to start by clarifying scope. Are we looking at a nationwide India rollout, or starting with Tier 1 cities like Delhi, Mumbai, and Bengaluru?",
  "Given that, I'd structure this as a market attractiveness and competitive feasibility analysis. On the market side I'd look at size, growth rate, and customer willingness to pay.",
  "My hypothesis is the revenue decline is concentrated in one or two SKU categories. Before I dig into costs I'd want to confirm, has revenue growth slowed across all segments, or is it product-specific?",
  "I'd estimate the total addressable market at roughly 40 to 60 million urban consumers, based on income strata and category penetration rates similar to Southeast Asia.",
  "The key risk I see is unit economics at scale. If cost-per-delivery doesn't compress with volume the model breaks. I'd want to see delivery density numbers for the top 3 cities before recommending expansion.",
]

const CLOSING_RESPONSES = [
  "Thank you, that was a well-structured close. I appreciated the clarity on the risks.",
  "Good wrap-up. You covered the key bases there.",
]



function Waveform({ active, color, isDark }: { active: boolean; color: string; isDark: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 32 }}>
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} style={{
          width: 3,
          height: active ? `${25 + Math.random() * 50}%` : '15%',
          backgroundColor: color,
          borderRadius: 3,
          opacity: active ? 0.6 + Math.random() * 0.4 : isDark ? 0.15 : 0.25,
          animation: active ? `wave-bar ${0.45 + (i % 5) * 0.1}s ease-in-out infinite alternate` : 'none',
          animationDelay: `${(i * 0.06) % 0.5}s`,
          transition: 'height 0.12s, opacity 0.2s',
        }} />
      ))}
    </div>
  )
}

function PulseRing({ active, color }: { active: boolean; color: string }) {
  if (!active) return null
  return (
    <>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          position: 'absolute',
          inset: -14 - i * 10,
          borderRadius: '50%',
          border: `1.5px solid ${color}`,
          animation: 'pulse-ring 2s ease-out infinite',
          animationDelay: `${i * 0.65}s`,
          pointerEvents: 'none',
          opacity: 0.4,
        }} />
      ))}
    </>
  )
}



const INTERVIEWER_BIOS: Record<string, string[]> = {
  'Profitability': [
    "Spent years driving margin turnaround and cost-reduction at a top-tier firm.",
    "Former engagement manager specializing in profitability and cost optimization."
  ],
  'Market Entry': [
    "Led market-entry and international expansion strategy for Fortune 500 clients.",
    "Specialized in new market strategy and launch execution before moving into coaching."
  ],
  'M&A / Growth Strategy': [
    "Spent years leading M&A and deal strategy work at a top-tier consulting firm.",
    "Specialized in commercial due diligence and growth strategy for private equity clients."
  ],
  'Pricing': [
    "Specialized in pricing and monetization strategy across consumer and B2B engagements.",
    "Former consultant who drove pricing optimization and monetization models for global brands."
  ],
  'Operations': [
    "Spent years leading operations and process improvement engagements.",
    "Former supply chain and operations specialist at a top-tier consulting firm."
  ],
  'Guesstimate': [
    "Specialized in rapid quantitative estimation and back-of-the-envelope modeling.",
    "Former consultant with deep experience in rapid sizing and ambiguous quantitative problems."
  ],
  'Product Design': [
    "Led 0-to-1 product design work at an early-stage startup before moving into PM coaching.",
    "Former PM who specialized in user-centric design and launching new consumer experiences."
  ],
  'Product Improvement': [
    "Former PM focused on growth, optimization, and feature improvement at a major tech company.",
    "Spent years optimizing user journeys and driving product improvements as a lead PM."
  ],
  'Metrics / Root-Cause': [
    "Former data-focused PM who spent years diagnosing metric drops at a fast-growing tech company.",
    "Specialized in analytics and root-cause teardowns as a senior product manager."
  ],
  'Prioritization / Tradeoff': [
    "Led product strategy and managed complex roadmap trade-offs across multiple stakeholder groups.",
    "Former PM who specialized in strategic prioritization and resource allocation."
  ],
  'Strategy / Go-to-Market': [
    "Former lead PM focused on go-to-market strategy and high-stakes product launches.",
    "Spent years driving product strategy and successful GTM execution."
  ],
  'Product Guesstimate': [
    "Former PM who specialized in market sizing and quantitative feature estimation.",
    "Led heavily quantitative product strategy and market analysis at a top tech firm."
  ]
}

const FEMALE_NAMES = ['Priya', 'Ananya', 'Kavya', 'Sneha', 'Divya', 'Neha', 'Ritika', 'Pooja', 'Meera', 'Anjali']
const MALE_NAMES = ['Rahul', 'Arjun', 'Vikram', 'Aditya', 'Karan', 'Rohan', 'Nikhil', 'Siddharth', 'Varun', 'Aman']
const INITIALS = ['S.', 'K.', 'M.', 'V.', 'R.', 'D.', 'P.', 'B.', 'N.', 'G.']

const FEMALE_VOICES = [
  'en-IN-Wavenet-A',
  'en-IN-Wavenet-D',
  'en-IN-Wavenet-E'
]
const MALE_VOICES = [
  'en-IN-Wavenet-B',
  'en-IN-Wavenet-C',
  'en-IN-Wavenet-F'
]

function getRandomItem(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function CaseInterview() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { cases: CASES, loading: casesLoading } = useCases()
  const { user } = useAuth()
  
  const caseData = CASES.find(c => c.id === id)
  const isDark = theme === 'dark'

  const [callState, setCallState] = useState<CallState>('idle')
  const [callError, setCallError] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('active')
  const [transcript, setTranscript] = useState<Turn[]>([])
  const [liveText, setLiveText] = useState('')
  const [speakingText, setSpeakingText] = useState('')
  const [turnNum, setTurnNum] = useState(0)
  const [userTurnCount, setUserTurnCount] = useState(0)
  const [hintHistory, setHintHistory] = useState<{ points: { lead: string, detail: string }[], timestamp: number }[]>([])
  const [hasSeenExplainer, setHasSeenExplainer] = useState(() => localStorage.getItem('vantage-hint-explainer-seen') === '1')
  const [loadingHint, setLoadingHint] = useState(false)
  const [sidebarTab, setSidebarTab] = useState<'transcript' | 'hints'>('transcript')
  const [showHints, setShowHints] = useState(false)
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [waveKey, setWaveKey] = useState(0)
  const [readyToStart, setReadyToStart] = useState(false)
  const [micPermissionState, setMicPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown')
  const [interviewerBio, setInterviewerBio] = useState('')

  useEffect(() => {
    if (caseData?.subtype) {
      const bios = INTERVIEWER_BIOS[caseData.subtype]
      if (bios && bios.length > 0) {
        setInterviewerBio(bios[Math.floor(Math.random() * bios.length)])
      } else {
        setInterviewerBio(caseData.track === 'consulting' 
          ? "Former consultant and engagement manager."
          : "Former product manager and product leader.")
      }
    }
  }, [caseData])

  const checkMicPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName })
      setMicPermissionState(result.state as 'prompt' | 'granted' | 'denied')
      result.onchange = () => {
        setMicPermissionState(result.state as 'prompt' | 'granted' | 'denied')
      }
    } catch (e) {
      setMicPermissionState('unknown')
    }
  }

  useEffect(() => {
    checkMicPermission()
  }, [])

  const scrollRef = useRef<HTMLDivElement>(null)
  const speakTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const transcriptRef = useRef<Turn[]>([])
  const elapsedRef = useRef(0)

  const userCountRef = useRef(0)
  const recognitionRef = useRef<any>(null)
  const liveTextRef = useRef('')
  const callStateRef = useRef<CallState>('idle')
  const phaseRef = useRef<Phase>('active')
  const turnNumRef = useRef(0)
  const processTurnRef = useRef<any>(null)
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasStartedRef = useRef(false)
  const interruptedRef = useRef(false)
  const isScrolledToBottomRef = useRef(true)
  const isMountedRef = useRef(true)
  const activeAudioRef = useRef<HTMLAudioElement | null>(null)
  
  const [sessionId, setSessionId] = useState<string | null>(null)
  const sessionIdRef = useRef<string | null>(null)

  useEffect(() => { sessionIdRef.current = sessionId }, [sessionId])
  useEffect(() => { 
    transcriptRef.current = transcript 
    if (sessionIdRef.current && transcript.length > 1) {
      supabase.from('interview_sessions').update({
        conversation_history: transcript,
        updated_at: new Date().toISOString()
      }).eq('id', sessionIdRef.current).then(({ error }) => {
        if (error) console.error('Failed to sync transcript:', error)
      })
    }
  }, [transcript])
  useEffect(() => { elapsedRef.current = elapsedSeconds }, [elapsedSeconds])

  useEffect(() => { userCountRef.current = userTurnCount }, [userTurnCount])
  useEffect(() => { liveTextRef.current = liveText }, [liveText])
  useEffect(() => { callStateRef.current = callState }, [callState])
  useEffect(() => { phaseRef.current = phase }, [phase])
  useEffect(() => { turnNumRef.current = turnNum }, [turnNum])

  const handleRevealHint = async () => {
    if (loadingHint) return;
    setLoadingHint(true);
    
    try {
      const res = await fetch('/api/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseData?.id,
          conversation_history: transcriptRef.current
        })
      });
      const data = await res.json();
      
      if (data.points && data.points.length > 0) {
        setHintHistory(prev => [{ points: data.points, timestamp: Date.now() }, ...prev]);
        
        // Dismiss the one-time explainer after the first-ever hint
        if (!hasSeenExplainer) {
          setHasSeenExplainer(true);
          localStorage.setItem('vantage-hint-explainer-seen', '1');
        }
        
        if (sessionIdRef.current) {
          const { data: sessionData } = await supabase
            .from('interview_sessions')
            .select('hints_used')
            .eq('id', sessionIdRef.current)
            .single();
            
          const currentHints = (typeof sessionData?.hints_used === 'number') ? sessionData.hints_used : 0;
          await supabase.from('interview_sessions').update({
            hints_used: currentHints + 1
          }).eq('id', sessionIdRef.current);
        }
      }
    } catch (e) {
      console.error('Failed to fetch hint:', e);
    } finally {
      setLoadingHint(false);
    }
  }

  useEffect(() => {
    isMountedRef.current = true
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition && !recognitionRef.current) {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''
        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          } else {
            interimTranscript += event.results[i][0].transcript
          }
        }
        setLiveText(finalTranscript + interimTranscript)

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
        silenceTimerRef.current = setTimeout(() => {
          if (callStateRef.current === 'listening' && phaseRef.current !== 'ended') {
            if (recognitionRef.current) recognitionRef.current.stop()
            
            const phrase = liveTextRef.current || "I don't have anything to add right now."
            if (processTurnRef.current) {
               processTurnRef.current(phrase)
            }
          }
        }, 2500)
      }
      recognition.onerror = (e: any) => {
        if (e.error !== 'no-speech') console.error('Speech error:', e)
      }
      // Removed onend auto-send, relying on silence timer instead to avoid double calls
      recognitionRef.current = recognition
    }
    
    // Try to load voices proactively
    if (window.speechSynthesis) {
       window.speechSynthesis.getVoices()
    }

    // Cleanup: stop everything on unmount
    return () => {
      isMountedRef.current = false
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch (_) {}
        recognitionRef.current = null
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      if (activeAudioRef.current) {
        activeAudioRef.current.pause()
        activeAudioRef.current = null
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
        silenceTimerRef.current = null
      }
      if (speakTimerRef.current) {
        clearTimeout(speakTimerRef.current)
        speakTimerRef.current = null
      }
    }
  }, [])

  const trackColor = caseData?.track === 'consulting' ? 'var(--coral)' : 'var(--primary-bright)'
  const trackColorRaw = caseData?.track === 'consulting' ? '#f43f5e' : '#A78BFA'
  
  // INVARIANT: Interviewer names must remain Indian-sounding (e.g. Priya K., Rahul S.) 
  // to ensure consistent persona demographics going forward.
  const [interviewer] = useState(() => {
    const isFemale = Math.random() > 0.5
    const nameList = isFemale ? FEMALE_NAMES : MALE_NAMES
    const firstName = getRandomItem(nameList)
    const lastInitial = getRandomItem(INITIALS)
    const voicePool = isFemale ? FEMALE_VOICES : MALE_VOICES
    const voice = getRandomItem(voicePool)
    return {
      name: `${firstName} ${lastInitial}`,
      firstName: firstName,
      role: caseData?.track === 'consulting' ? 'Ex-McKinsey EM' : 'Ex-Google PM',
      initials: `${firstName[0]}${lastInitial[0]}`,
      firm: caseData?.track === 'consulting' ? 'Consulting' : 'Product',
      image: isFemale ? img12 : img13,
      voiceName: voice
    }
  })

  useEffect(() => {
    const t = setInterval(() => setElapsedSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const handleTranscriptScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    const threshold = 50 // px from bottom
    isScrolledToBottomRef.current = target.scrollHeight - target.scrollTop - target.clientHeight <= threshold
  }

  useEffect(() => {
    if (isScrolledToBottomRef.current && sidebarTab === 'transcript') {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [transcript, sidebarTab])

  if (casesLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading case data...</div>
      </div>
    )
  }

  // Fallback if no case found after loading
  if (!caseData) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Case not found.</div>
      </div>
    )
  }


  const handleEndSession = async () => {
    if (!sessionIdRef.current || !caseData) return
    
    setCallState('processing')
    try {
      const res = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionIdRef.current })
      })
      
      if (!res.ok) {
        throw new Error(`Grade API failed with status ${res.status}`)
      }
      
      let gradingResult = null
      const data = await res.json()
      gradingResult = data.grading_result

      await supabase.from('interview_sessions').update({
        status: 'completed',
        ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        grading_result: gradingResult
      }).eq('id', sessionIdRef.current)
      
      import('./Dashboard').then(m => m.invalidateDashboardCache())

      // Navigate to feedback passing the sessionId
      navigate('/feedback', { state: { sessionId: sessionIdRef.current, interviewer } })
    } catch (e) {
      console.error('Failed to end session and grade:', e)
      setCallState('idle')
      alert("Failed to grade the session. Please check your connection and ensure the database schema is updated.")
    }
  }

  const handleLeaveWithoutSaving = async () => {
    if (sessionIdRef.current) {
      await supabase.from('interview_sessions').delete().eq('id', sessionIdRef.current)
    }
    navigate('/hub')
  }
  const speakWithVoice = async (text: string, onDone: (wasInterrupted: boolean) => void) => {
    if (window.speechSynthesis) window.speechSynthesis.cancel()
    if (activeAudioRef.current) {
      activeAudioRef.current.pause()
      activeAudioRef.current = null
    }
    
    if (!isMountedRef.current) return
    setSpeakingText('')

    try {
      const tokens = text.match(/\S+|\s+/g) || []
      let ssml = '<speak>'
      let markCount = 0
      const tokenMarkMap = new Map<string, number>()
      
      const escapeSSML = (str: string) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

      for (let i = 0; i < tokens.length; i++) {
         const token = tokens[i]
         if (/\S/.test(token)) {
            const markName = `t${markCount}`
            ssml += `<mark name="${markName}"/>${escapeSSML(token)}`
            tokenMarkMap.set(markName, i)
            markCount++
         } else {
            ssml += escapeSSML(token)
         }
      }
      ssml += '</speak>'

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, ssml, voiceName: interviewer.voiceName })
      })
      const data = await response.json()
      
      if (!data.audioContent) throw new Error('No audio returned')
      
      const audioBlob = new Blob([Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))], { type: 'audio/mp3' })
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      activeAudioRef.current = audio
      
      const timepoints = data.timepoints || []
      let animationFrameId: number;
      
      const tick = () => {
         if (!isMountedRef.current || interruptedRef.current) return;
         const currentTime = audio.currentTime;
         
         let latestTokenIdx = -1;
         for (let i = 0; i < timepoints.length; i++) {
            const tp = timepoints[i];
            let tSeconds = 0;
            if (typeof tp.timeSeconds === 'number') {
               tSeconds = tp.timeSeconds;
            } else if (tp.timeSeconds && typeof tp.timeSeconds === 'object') {
               tSeconds = (parseInt(tp.timeSeconds.seconds || 0, 10)) + (tp.timeSeconds.nanos || 0) / 1e9;
            }
            
            if (currentTime >= tSeconds) {
               const markName = tp.markName;
               const tokIdx = tokenMarkMap.get(markName);
               if (tokIdx !== undefined) {
                  let endIdx = tokIdx;
                  while (endIdx + 1 < tokens.length && /^\s+$/.test(tokens[endIdx + 1])) {
                     endIdx++;
                  }
                  latestTokenIdx = endIdx;
               }
            } else {
               break; // Assuming timepoints are ordered
            }
         }
         
         if (latestTokenIdx >= 0) {
            setSpeakingText(tokens.slice(0, latestTokenIdx + 1).join(''));
         }
         
         animationFrameId = requestAnimationFrame(tick);
      }

      audio.onplay = () => {
         animationFrameId = requestAnimationFrame(tick);
      }

      audio.onended = () => {
         if (animationFrameId) cancelAnimationFrame(animationFrameId);
         if (!isMountedRef.current) return
         const wasInterrupted = interruptedRef.current
         interruptedRef.current = false
         setSpeakingText(text)
         onDone(wasInterrupted)
      }

      audio.onerror = () => {
         if (animationFrameId) cancelAnimationFrame(animationFrameId);
         if (!isMountedRef.current) return
         setSpeakingText(text)
         onDone(false)
      }

      await audio.play()
      
    } catch (e) {
      console.error('TTS Playback error', e)
      setSpeakingText(text)
      onDone(false)
    }
  }

  useEffect(() => {
    if (casesLoading || !caseData || !readyToStart || hasStartedRef.current) return
    hasStartedRef.current = true

    // Request microphone permission first before anything starts
    navigator.mediaDevices.getUserMedia({ audio: true }).then(async (stream) => {
      if (!isMountedRef.current) { stream.getTracks().forEach(t => t.stop()); return }
      // Release it immediately, we just wanted to grant permission upfront
      stream.getTracks().forEach(track => track.stop())
      
      setCallState('processing')
      
      let bioFormatted = interviewerBio
      if (interviewerBio) {
        if (interviewerBio.startsWith("Former")) {
          bioFormatted = "I'm a " + interviewerBio.charAt(0).toLowerCase() + interviewerBio.slice(1)
        } else if (interviewerBio.startsWith("Spent") || interviewerBio.startsWith("Led") || interviewerBio.startsWith("Specialized")) {
          bioFormatted = "I " + interviewerBio.charAt(0).toLowerCase() + interviewerBio.slice(1)
        }
      }
      
      const templates = [
        `Hi, I'm ${interviewer.firstName}. ${bioFormatted} Let's get started. ${caseData.opening_question}`,
        `Hi there, I'm ${interviewer.firstName}. ${bioFormatted} Let's dive right into the case. ${caseData.opening_question}`,
        `Welcome, I'm ${interviewer.firstName}. ${bioFormatted} Let's begin. ${caseData.opening_question}`
      ]
      let opener = templates[Math.floor(Math.random() * templates.length)]
      
      if (!isMountedRef.current) return
      
      setCallState('speaking')
      
      speakWithVoice(opener, async (wasInterrupted) => {
        if (wasInterrupted || !isMountedRef.current) return;
        if (callStateRef.current === 'speaking') {
          const initialTranscript: Turn[] = [{ role: 'interviewer', text: opener, turnNum: 0 }]
          setTranscript(initialTranscript)
          setSpeakingText('')
          
          try {
            const { data, error } = await supabase.from('interview_sessions').insert({
              user_id: user?.id || null,
              case_id: caseData.id,
              subtype: caseData.subtype,
              conversation_history: initialTranscript,
              status: 'active'
            }).select('id').single()
            if (data && !error) {
              setSessionId(data.id)
            } else if (error) {
              console.error('Failed to start session in Supabase:', error)
            }
          } catch (e) {
            console.error('Supabase insert exception:', e)
          }
          
          if (!isMountedRef.current) return
          // Loop back to listening immediately after opener
          setCallState('listening')
          setLiveText('')
          setWaveKey(k => k + 1)
          if (recognitionRef.current) {
            try { recognitionRef.current.start() } catch (e) {}
          }
        }
      })
    }).catch((err) => {
      console.error('Microphone access denied:', err)
      if (!isMountedRef.current) return
      
      setCallError('Microphone access denied. Please enable microphone permissions in your browser settings to continue.')
      setCallState('error')
    })
  }, [casesLoading, caseData, readyToStart])
  const apiChatEndpoint = async (messages: Turn[], latestText: string) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: id,
          conversation_history: messages.slice(0, -1).map(m => ({ role: m.role, text: m.text })),
          latest_user_message: latestText
        })
      })
      const data = await response.json()
      if (data.error === 'API_ERROR_QUOTA') {
        return { isError: true, message: "The interviewer couldn't connect right now (API Quota Exceeded). Please try again later." }
      }
      let reply = data.reply || "Sorry, I lost my train of thought. Could you repeat that?"
      // Frontend safety net: Strip stray markdown characters (*, _, #)
      reply = reply.replace(/[*_#]/g, '')
      return reply
    } catch (e) {
      console.error('API Error:', e)
      return "Sorry, I lost my train of thought. Could you repeat that?"
    }
  }

  const processTurn = async (phrase: string) => {
    const newTurnNum = turnNumRef.current + 1
    const newUserCount = userCountRef.current + 1
    
    const updatedTranscript = [...transcriptRef.current, { role: 'user' as const, text: phrase, turnNum: newTurnNum }]
    setTranscript(updatedTranscript)
    setTurnNum(newTurnNum)
    setUserTurnCount(newUserCount)
    setLiveText('')
    setCallState('processing')

    // Connect to real API route
    const response = await apiChatEndpoint(updatedTranscript, phrase)
    
    if (typeof response === 'object' && response !== null && response.isError) {
      setCallError(response.message)
      setCallState('error')
      return
    }

    const reply = response as string
    
    setCallState('speaking')
    
    speakWithVoice(reply, (wasInterrupted) => {
      if (wasInterrupted) return;
      if (callStateRef.current === 'speaking') {
         const respTurn = newTurnNum + 1
         setTranscript(prev => [...prev, { role: 'interviewer', text: response, turnNum: respTurn }])
         setSpeakingText('')
         setTurnNum(respTurn)
         
         // Loop back to listening
         setCallState('listening')
         setLiveText('')
         setWaveKey(k => k + 1)
         if (recognitionRef.current) {
            try { recognitionRef.current.start() } catch (e) {}
         }
      }
    })
  }

  useEffect(() => { processTurnRef.current = processTurn }, [processTurn])

  const handleMicPress = () => {
    // We only need the mic press to initially start the loop if it's idle, or stop it if we want to force send early.
    if (phase === 'ended') return

    if (callState === 'idle') {
      // Start recording manually (usually it auto starts)
      setCallState('listening')
      setLiveText('')
      setWaveKey(k => k + 1)
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start()
        } catch (e) {
          console.error(e)
        }
      }
    } else if (callState === 'listening') {
      // Force stop recording and process immediately
      if (recognitionRef.current) {
        recognitionRef.current.stop() // this will trigger onend naturally and auto-submit
      }
    }
  }

  const handleInterrupt = () => {
    interruptedRef.current = true
    // 1. Cancel typing
    if (speakTimerRef.current) clearTimeout(speakTimerRef.current)
    // 2. Cancel audio out loud
    if (window.speechSynthesis) window.speechSynthesis.cancel()
    if (activeAudioRef.current) {
      activeAudioRef.current.pause()
      activeAudioRef.current = null
    }
    
    let cutText = speakingText.trim()
    if (cutText && !cutText.endsWith('...')) cutText += '...'

    const nextTurn = turnNumRef.current + 1
    setTranscript(prev => [...prev, { role: 'interviewer', text: cutText, turnNum: nextTurn }])
    setTurnNum(nextTurn)
    setSpeakingText('')
    
    // 3. Immediately switch back to listening
    setCallState('listening')
    setLiveText('')
    setWaveKey(k => k + 1)
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
      } catch(e) {
        console.error(e)
      }
    }
  }

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  // Stage background
  const stageBg = isDark
    ? callState === 'speaking'
      ? `radial-gradient(ellipse at 50% 40%, ${trackColorRaw}1a 0%, #0d0f14 65%)`
      : '#0d0f14'
    : callState === 'speaking'
      ? `radial-gradient(ellipse at 50% 40%, ${trackColorRaw}18 0%, #f5f0ff 70%)`
      : 'linear-gradient(160deg, #f5f0ff 0%, #faf9ff 50%, #ffffff 100%)'

  const avatarBg = isDark
    ? `linear-gradient(135deg, ${trackColorRaw}44, ${trackColorRaw}22)`
    : `linear-gradient(135deg, ${trackColorRaw}33, ${trackColorRaw}18)`

  const avatarBorder = callState === 'speaking'
    ? trackColorRaw
    : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(124,58,237,0.2)'

  const textColor = isDark ? '#fff' : '#1a1035'
  const mutedColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(26,16,53,0.45)'

  const bubbleBg = isDark
    ? 'rgba(255,255,255,0.06)'
    : 'rgba(255,255,255,0.95)'

  const bubbleBorder = isDark
    ? `${trackColorRaw}30`
    : `${trackColorRaw}40`

  const bubbleText = isDark ? 'rgba(255,255,255,0.92)' : '#1a1035'

  const userStageBg = isDark
    ? callState === 'listening'
      ? 'radial-gradient(ellipse at bottom center, rgba(124,58,237,0.1) 0%, transparent 70%)'
      : 'rgba(0,0,0,0.25)'
    : callState === 'listening'
      ? 'radial-gradient(ellipse at bottom center, rgba(124,58,237,0.06) 0%, transparent 70%)'
      : 'rgba(255,255,255,0.6)'

  const micBg = callState === 'listening'
    ? 'linear-gradient(135deg, #e11d48, #f43f5e)'
    : callState !== 'idle'
      ? isDark ? 'rgba(255,255,255,0.06)' : 'rgba(124,58,237,0.08)'
      : 'linear-gradient(135deg, #7C3AED, #A78BFA)'

  const micShadow = callState === 'listening'
    ? '0 0 0 0 rgba(244,63,94,0.4), 0 8px 24px rgba(244,63,94,0.45)'
    : callState === 'idle'
      ? '0 6px 24px rgba(124,58,237,0.4)'
      : 'none'

  const liveHintText = isDark ? 'rgba(255,255,255,0.28)' : 'rgba(26,16,53,0.35)'
  const stateBadgeBg = callState === 'speaking'
    ? isDark ? `${trackColorRaw}22` : `${trackColorRaw}14`
    : callState === 'processing'
      ? 'rgba(245,158,11,0.12)'
      : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(124,58,237,0.06)'
  const stateBadgeColor = callState === 'speaking'
    ? trackColor
    : callState === 'processing'
      ? '#F59E0B'
      : isDark ? 'rgba(255,255,255,0.38)' : 'rgba(26,16,53,0.45)'

  // Ready-to-start screen — asks for explicit permission before starting
  if (!readyToStart) {
    if (micPermissionState === 'denied') {
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
      
      let instructions = "Click the lock/info icon in the address bar → Site settings → Microphone → Allow → reload the page."; // Default Chrome
      if (isSafari) instructions = "Safari menu → Settings → Websites → Microphone → find this site → change to Allow → reload the page.";
      if (isFirefox) instructions = "Click the lock icon in the address bar → Connection secure → More information → Permissions → clear the Microphone block → reload the page.";

      return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', padding: '20px' }}>
          <div style={{ 
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, 
            maxWidth: 440, textAlign: 'center', padding: '40px 32px',
            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
            borderRadius: 24,
            border: '1px solid var(--border)',
            boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 12px 48px rgba(0,0,0,0.06)'
          }}>
            <div style={{ 
              width: 56, height: 56, borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="2" y1="2" x2="22" y2="22"></line>
                <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"></path>
                <path d="M5 10v2a7 7 0 0 0 12 5"></path>
                <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"></path>
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            </div>
            
            <div>
              <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
                Microphone access is blocked for this site.
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                {instructions}
              </p>
            </div>

            <button
              onClick={() => checkMicPermission()}
              style={{
                padding: '12px 24px', borderRadius: 12, border: 'none',
                background: 'var(--text-primary)',
                color: 'var(--bg)', fontSize: 15, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', width: '100%', marginTop: 8
              }}
            >
              I've enabled it, try again
            </button>
            <button
              onClick={() => navigate('/hub')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
            >
              Back to cases
            </button>
          </div>
        </div>
      )
    }

    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', padding: '20px' }}>
        <div style={{ 
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, 
          maxWidth: 440, textAlign: 'center', padding: '40px 32px',
          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
          borderRadius: 24,
          border: '1px solid var(--border)',
          boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 12px 48px rgba(0,0,0,0.06)'
        }}>
          {/* Interviewer avatar */}
          <img src={interviewer.image} alt={interviewer.name} style={{ width: 100, height: 100, borderRadius: '50%', border: `2px solid ${trackColorRaw}40`, objectFit: 'cover' }} />
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px', textAlign: 'center' }}>
              {caseData.title}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 auto', lineHeight: 1.5, maxWidth: 300, textAlign: 'center' }}>
              <span style={{ color: trackColor, fontWeight: 600 }}>{interviewer.name}</span> <br/> {interviewerBio}
            </p>
          </div>

          <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            This practice session uses your microphone so you can speak naturally with your buddy. You will be asked for microphone access when you start.
          </div>

          <button
            onClick={() => setReadyToStart(true)}
            style={{
              padding: '14px 36px', borderRadius: 14, border: 'none',
              background: `linear-gradient(135deg, ${trackColorRaw}, ${trackColorRaw}cc)`,
              color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', transition: 'transform 0.15s, box-shadow 0.15s',
              boxShadow: `0 4px 16px ${trackColorRaw}40`,
              display: 'flex', alignItems: 'center', gap: 10
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
          >
            {/* Mic icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <rect x="9" y="2" width="6" height="12" rx="3" fill="currentColor" />
              <path d="M5 10a7 7 0 0014 0" />
              <line x1="12" y1="17" x2="12" y2="21" />
              <line x1="8" y1="21" x2="16" y2="21" />
            </svg>
            Start Practicing
          </button>

          <button
            onClick={() => navigate('/hub')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif', padding: '4px 8px' }}
          >
            Back to cases
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '100vh', display: 'flex', backgroundColor: 'var(--bg)', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>

      {/* ── LEFT MAIN STAGE ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        
        {/* TOP BAR */}
        <div style={{ flexShrink: 0, padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
              backgroundColor: caseData.track === 'consulting' ? 'var(--coral)' : 'var(--primary)', color: '#fff',
            }}>
              {caseData.track}
            </span>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {caseData.title}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
              {formatTime(elapsedSeconds)}
            </span>
            <button onClick={() => setShowLeaveModal(true)}
              style={{ padding: '8px 16px', borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', color: 'var(--text-primary)', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.1)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
            >
              End Session
            </button>
          </div>
        </div>

        {/* ACTIVE STAGE AREA (Avatar + Live Text) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 40px', position: 'relative', overflow: 'hidden' }}>
          
          <div style={{ flexShrink: 0, position: 'relative', display: 'flex', justifyContent: 'center', marginTop: 40, zIndex: 10 }}>
            {/* Center Avatar */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: callState === 'idle' ? 1 : 0.6, transition: 'opacity 0.4s' }}>
              <img src={interviewer.image} alt={interviewer.name} style={{ width: 72, height: 72, borderRadius: '50%', border: `2px solid ${avatarBorder}`, objectFit: 'cover' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: textColor }}>{interviewer.name}</div>
                <div style={{ fontSize: 12, color: mutedColor }}>AI Interviewer</div>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: 20, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 100, background: `linear-gradient(to bottom, var(--bg), transparent)`, zIndex: 2, pointerEvents: 'none' }} />

            {transcript.slice(-3).map((t, i, arr) => (
              <div key={t.turnNum} style={{ 
                animation: 'fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)', 
                opacity: i === 0 && arr.length === 3 ? 0.4 : i === 1 && arr.length === 3 ? 0.7 : 1,
                transform: `scale(${i === 0 && arr.length === 3 ? 0.94 : i === 1 && arr.length === 3 ? 0.97 : 1}) translateY(${i === 0 && arr.length === 3 ? -10 : i === 1 && arr.length === 3 ? -5 : 0}px)`,
                transition: 'all 0.5s ease',
                transformOrigin: 'bottom center',
                textAlign: 'center',
                marginBottom: 24
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.role === 'user' ? 'var(--primary-bright)' : trackColor, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  {t.role === 'user' ? 'You' : interviewer.name}
                </div>
                <p style={{ fontSize: 24, color: textColor, lineHeight: 1.5, margin: 0, fontWeight: 500 }}>{t.text}</p>
              </div>
            ))}

            {(callState === 'speaking' || callState === 'listening') && (
              <div style={{ animation: 'fade-in-up 0.3s ease', textAlign: 'center', marginTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: callState === 'listening' ? 'var(--primary-bright)' : trackColor, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  {callState === 'listening' ? 'You' : interviewer.name}
                </div>
                <p style={{ fontSize: 26, color: textColor, lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
                  {callState === 'listening' ? liveText : speakingText}
                  <span style={{ display: 'inline-block', width: 3, height: '0.85em', backgroundColor: callState === 'listening' ? 'var(--primary-bright)' : trackColor, marginLeft: 6, verticalAlign: 'middle', animation: 'thinking-dot 0.8s ease-in-out infinite' }} />
                </p>
              </div>
            )}
            {callState === 'processing' && (
              <div style={{ textAlign: 'center', marginTop: 24, animation: 'fade-in-up 0.3s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#F59E0B', display: 'inline-block', animation: 'thinking-dot 1.2s ease-in-out infinite', animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  {interviewer.name.split(' ')[0]} is thinking...
                </div>
              </div>
            )}
            {callState === 'error' && (
              <div style={{ textAlign: 'center', marginTop: 24, padding: '24px', borderRadius: 16, backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)', border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.3)'}`, animation: 'fade-in-up 0.3s ease' }}>
                <div style={{ color: '#ef4444', marginBottom: 12 }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <p style={{ fontSize: 16, color: '#ef4444', lineHeight: 1.5, margin: 0, fontWeight: 600 }}>
                  {callError || "An unexpected error occurred."}
                </p>
                <button
                  onClick={() => {
                    setCallState('idle')
                    setCallError(null)
                  }}
                  style={{ marginTop: 20, padding: '8px 24px', borderRadius: 100, border: 'none', background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                >
                  Dismiss
                </button>
              </div>
            )}
            {callState === 'idle' && transcript.length === 0 && (
              <div style={{ textAlign: 'center', opacity: 0.5 }}>
                 <p style={{ fontSize: 24, color: textColor, lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
                   Let's jump in.
                 </p>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM INTERACTION BAR */}
        <div style={{ height: 160, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          
          {/* Tap to interrupt button */}
          {callState === 'speaking' ? (
             <button 
                onMouseDown={() => {
                   setPhraseIndex(p => p + 1)
                   handleInterrupt()
                }}
                style={{ padding: '6px 14px', borderRadius: 100, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text-primary)', fontSize: 11, fontWeight: 700, cursor: 'pointer', animation: 'fade-in-up 0.3s ease', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                Tap to interrupt
             </button>
          ) : (
             <div style={{ height: 28 }} />
          )}

          <button
            onMouseDown={() => {
              if (callState === 'speaking') {
                setPhraseIndex(p => p + 1)
                handleInterrupt()
              } else if (callState === 'idle') {
                setPhraseIndex(p => p + 1)
                handleMicPress()
              }
            }}
            disabled={phase === 'ended'}
            style={{
              width: 140, height: 52, borderRadius: 26, border: 'none',
              background: callState === 'speaking' || callState === 'listening' 
                ? 'linear-gradient(90deg, rgba(67,130,255,0.8) 0%, rgba(159,85,255,0.8) 50%, rgba(255,85,85,0.8) 100%)' 
                : isDark ? 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.15) 100%)' : 'linear-gradient(90deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.1) 100%)',
              cursor: callState === 'idle' && phase !== 'ended' ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: callState === 'listening' || callState === 'speaking' ? '0 8px 32px rgba(159,85,255,0.3)' : 'none',
              transform: callState === 'listening' ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden'
            }}
          >
            {(callState === 'speaking' || callState === 'listening') ? (
               <div style={{ position: 'absolute', bottom: -15, width: '90%', height: 40, background: '#fff', filter: 'blur(16px)', opacity: 0.9, animation: 'wave-bar 1.5s infinite alternate ease-in-out' }} />
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: isDark ? '#fff' : '#000', opacity: 0.8 }}>
                <rect x="9" y="2" width="6" height="12" rx="3" fill="currentColor" />
                <path d="M5 10a7 7 0 0014 0" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── RIGHT SIDEBAR ── */}
      <div style={{ width: 360, backgroundColor: 'var(--bg2)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', zIndex: 10, flexShrink: 0 }}>
        
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          <button onClick={() => setSidebarTab('transcript')}
            style={{ flex: 1, padding: '12px 0', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: sidebarTab === 'transcript' ? 'var(--text-primary)' : 'var(--text-muted)', borderBottom: sidebarTab === 'transcript' ? `2px solid ${trackColorRaw}` : '2px solid transparent' }}>
            Transcript
          </button>
          <button onClick={() => setSidebarTab('hints')}
            style={{ flex: 1, padding: '12px 0', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: sidebarTab === 'hints' ? 'var(--text-primary)' : 'var(--text-muted)', borderBottom: sidebarTab === 'hints' ? `2px solid ${trackColorRaw}` : '2px solid transparent' }}>
            Hints
          </button>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }} onScroll={handleTranscriptScroll}>
          {sidebarTab === 'transcript' && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
               {transcript.map((t, i) => (
                 <div key={i} style={{ alignSelf: t.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '90%' }}>
                   <div style={{ fontSize: 11, fontWeight: 700, color: t.role === 'user' ? 'var(--primary-bright)' : trackColor, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, textAlign: t.role === 'user' ? 'right' : 'left' }}>
                     {t.role === 'user' ? 'You' : interviewer.name}
                   </div>
                   <div style={{ padding: '12px 16px', borderRadius: 16, backgroundColor: t.role === 'user' ? 'var(--primary-subtle)' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6, border: `1px solid ${t.role === 'user' ? 'var(--primary-glow)' : 'transparent'}` }}>
                     {t.text}
                   </div>
                 </div>
               ))}
               <div ref={scrollRef} />
             </div>
          )}

          {sidebarTab === 'hints' && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
               {/* Prompt + single hint button — centered */}
               <div style={{ padding: '20px', borderRadius: 16, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
                 <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                   Stuck? Get a context-aware hint based on exactly where you are right now.
                 </div>

                 {/* One-time explainer — shown only before the first-ever hint */}
                 {!hasSeenExplainer && hintHistory.length === 0 && (
                   <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, fontStyle: 'italic', maxWidth: 280 }}>
                     Tap for a hint. Ask again if you need more — hints get more detailed each time, based on where you are stuck.
                   </div>
                 )}

                 {hintHistory.length >= 20 ? (
                   <div style={{ padding: '16px', borderRadius: 12, backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)', border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                     You've used all your hints for this case — try working through the rest with what you've got, or wrap up and review it in feedback.
                   </div>
                 ) : (
                   <button 
                     onClick={handleRevealHint}
                     disabled={loadingHint}
                     style={{ 
                       padding: '10px 20px', 
                       borderRadius: 100, 
                       border: '1px solid var(--primary-bright)', 
                       background: loadingHint ? 'var(--primary-subtle)' : 'var(--primary)', 
                       color: '#fff', 
                       fontSize: 14, 
                       fontWeight: 600, 
                       cursor: loadingHint ? 'not-allowed' : 'pointer',
                       display: 'flex',
                       alignItems: 'center',
                       gap: 8,
                       transition: 'all 0.2s',
                       boxShadow: 'none'
                     }}>
                     {loadingHint ? (
                       <>
                         <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                         Thinking...
                       </>
                     ) : (
                       <>
                         {/* Lightbulb icon */}
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                           <path d="M9 18h6" />
                           <path d="M10 22h4" />
                           <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
                         </svg>
                         {hintHistory.length > 0 ? "Get Another Hint" : "Get a Hint"}
                       </>
                     )}
                   </button>
                 )}
               </div>

               {/* Hint History Display */}
               <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                 {hintHistory.map((hint, idx) => {
                   const hintNumber = hintHistory.length - idx;
                   return (
                     <div key={hint.timestamp} style={{ 
                       padding: '12px 16px', 
                       borderRadius: 16, 
                       backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)', 
                       border: `1px solid var(--primary-subtle)`, 
                       animation: 'fade-in-up 0.3s ease',
                       position: 'relative'
                     }}>
                       {/* Sequence Indicator */}
                       <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                         <span style={{ 
                           fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', 
                           textTransform: 'uppercase', letterSpacing: '0.03em' 
                         }}>
                           Hint {hintNumber}
                         </span>
                       </div>

                       {/* Structured lead/detail hint points */}
                       <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                         {hint.points.map((point, pointIdx) => (
                           <div key={pointIdx} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                             <div style={{ 
                               width: 5, height: 5, borderRadius: '50%', 
                               backgroundColor: 'var(--primary-bright)', 
                               opacity: 0.8, marginTop: 8, flexShrink: 0 
                             }} />
                             <div style={{ fontSize: 14, lineHeight: 1.6 }}>
                               <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                 {point.lead}
                               </span>
                               {point.detail && (
                                 <span style={{ color: 'var(--text-secondary)' }}>
                                   {" — "}{point.detail}
                                 </span>
                               )}
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   );
                 })}
               </div>
             </div>
          )}
        </div>
      </div>

      {/* ── LEAVE MODAL ── */}
      {showLeaveModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(8px)' }}
          onClick={() => setShowLeaveModal(false)}>
          <div onClick={e => e.stopPropagation()}
            style={{ backgroundColor: 'var(--bg2)', borderRadius: 24, border: '1px solid var(--border)', padding: '32px', width: 380, boxShadow: 'var(--card-shadow-lg)', animation: 'fade-in-up 0.2s ease', textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 12px' }}>End Session?</h2>
            {userTurnCount === 0 ? (
              <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 32px', lineHeight: 1.6 }}>
                Let's get at least one exchange in before wrapping up — tap Keep Going to continue.
              </p>
            ) : (
              <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 32px', lineHeight: 1.6 }}>
                You've completed {userTurnCount} turn{userTurnCount !== 1 ? 's' : ''}. You can still get partial feedback based on your performance.
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {userTurnCount > 0 && (
                <button onClick={() => { if (callState !== 'processing') handleEndSession() }}
                  disabled={callState === 'processing'}
                  style={{ padding: '14px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #7C3AED, #A78BFA)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: callState === 'processing' ? 'wait' : 'pointer', fontFamily: 'Inter, sans-serif', opacity: callState === 'processing' ? 0.7 : 1 }}>
                  {callState === 'processing' ? 'Grading your session...' : 'End & Get Feedback'}
                </button>
              )}
              <button onClick={() => setShowLeaveModal(false)}
                style={{ padding: '14px', borderRadius: 12, border: '1px solid var(--border-strong)', backgroundColor: 'transparent', color: 'var(--text-primary)', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Keep Going
              </button>
              <button onClick={() => handleLeaveWithoutSaving()}
                style={{ background: 'none', border: 'none', color: 'var(--coral)', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif', padding: '8px', marginTop: 8, fontWeight: 600 }}>
                Leave without saving
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
