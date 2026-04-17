'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'

const REVIEWS = [
  {
    name: 'Trung Le',
    rating: 5,
    text: 'Best Detail For The Best Prices Out There! If You Need A Detail, This Is A MUST!!!',
  },
  {
    name: 'Elliot Christoph',
    rating: 5,
    text: 'Excellent, convenient service from Marlow. He does a very good detailing in reasonable time.',
  },
  {
    name: 'Greer Smyth',
    rating: 5,
    text: 'Jake from Marlow\'s Mobile Detailing did an exceptional job on my 4Runner. Jake is a dedicated and hard worker who really puts effort into the small details that matter. He proceeded to detail my car even when it was pouring rain. I would highly recommend his services!',
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={14} className={i <= rating ? 'fill-brand text-brand' : 'text-gray-700'} />
      ))}
    </div>
  )
}

export default function ReviewsSlider() {
  const [index, setIndex] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [direction, setDirection] = useState<'left' | 'right'>('right')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const go = useCallback(
    (dir: 'prev' | 'next') => {
      if (animating) return
      const total = REVIEWS.length
      setDirection(dir === 'next' ? 'right' : 'left')
      setAnimating(true)
      setTimeout(() => {
        setIndex((i) => (dir === 'next' ? (i + 1) % total : (i - 1 + total) % total))
        setAnimating(false)
      }, 220)
    },
    [animating]
  )

  useEffect(() => {
    timerRef.current = setTimeout(() => go('next'), 5000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [index, go])

  const review = REVIEWS[index]

  const slideClass = animating
    ? direction === 'right' ? 'opacity-0 -translate-x-3' : 'opacity-0 translate-x-3'
    : 'opacity-100 translate-x-0'

  return (
    <div className="space-y-6">
      {/* Overall rating summary */}
      <div className="flex items-center gap-3">
        <span className="font-display font-extrabold text-white text-4xl leading-none">5.0</span>
        <div className="flex flex-col gap-1">
          <StarRating rating={5} />
          <p className="text-gray-500 text-xs">{REVIEWS.length} Google reviews</p>
        </div>
        {/* Google G badge */}
        <div className="ml-auto w-8 h-8 rounded-full bg-surface-3 border border-white/[0.07] flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </div>
      </div>

      {/* Slider card */}
      <div className="relative">
        <div className={`bg-surface-2 border border-white/[0.07] rounded-2xl p-6 transition-all duration-[220ms] ease-in-out ${slideClass}`}>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-brand/20 flex items-center justify-center shrink-0 text-brand font-bold text-sm uppercase">
              {review.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">{review.name}</p>
            </div>
            <StarRating rating={review.rating} />
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">&ldquo;{review.text}&rdquo;</p>
        </div>

        <button
          onClick={() => go('prev')}
          aria-label="Previous review"
          className="absolute -left-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-surface-3 border border-white/[0.08] rounded-full flex items-center justify-center hover:border-brand/40 transition-colors"
        >
          <ChevronLeft size={14} className="text-gray-400" />
        </button>
        <button
          onClick={() => go('next')}
          aria-label="Next review"
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-surface-3 border border-white/[0.08] rounded-full flex items-center justify-center hover:border-brand/40 transition-colors"
        >
          <ChevronRight size={14} className="text-gray-400" />
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5">
        {REVIEWS.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > index ? 'right' : 'left'); setIndex(i) }}
            aria-label={`Review ${i + 1}`}
            className={`rounded-full transition-all duration-200 ${
              i === index ? 'w-4 h-1.5 bg-brand' : 'w-1.5 h-1.5 bg-white/15 hover:bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
