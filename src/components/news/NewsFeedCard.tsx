'use client'
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Skeleton,
  Typography,
} from '@mui/material'
import { ErrorOutline, OpenInNew } from '@mui/icons-material'
import { alpha, useTheme } from '@mui/material/styles'
import type { NewsFeedResult, NewsArticle } from '~/schemas/news'

// ---------------------------------------------------------------------------
// Date formatting
// ---------------------------------------------------------------------------

function formatPubDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Rome',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

// ---------------------------------------------------------------------------
// ArticleItem
// ---------------------------------------------------------------------------

interface ArticleItemProps {
  article: NewsArticle
  showDivider: boolean
}

function ArticleItem({ article, showDivider }: ArticleItemProps) {
  return (
    <>
      <Box
        component="a"
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          display: 'flex',
          gap: 1.5,
          py: 1.5,
          textDecoration: 'none',
          cursor: 'pointer',
          '&:hover .article-title': {
            color: 'primary.main',
          },
        }}
      >
        {article.imageUrl && (
          <Box
            component="img"
            src={article.imageUrl}
            alt=""
            loading="lazy"
            sx={{
              width: { xs: 80, sm: 96 },
              height: { xs: 56, sm: 64 },
              objectFit: 'cover',
              borderRadius: 1,
              flexShrink: 0,
              bgcolor: 'action.hover',
            }}
          />
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            className="article-title"
            variant="body2"
            sx={{
              fontWeight: 600,
              lineHeight: 1.35,
              color: 'text.primary',
              mb: 0.5,
              transition: 'color 0.15s ease',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {article.title}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
          >
            {formatPubDate(article.pubDate)}
          </Typography>
          {article.description && (
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.4,
              }}
            >
              {article.description}
            </Typography>
          )}
        </Box>
        <OpenInNew
          sx={{
            fontSize: '0.875rem',
            color: 'text.disabled',
            flexShrink: 0,
            alignSelf: 'flex-start',
            mt: 0.3,
          }}
        />
      </Box>
      {showDivider && <Divider />}
    </>
  )
}

// ---------------------------------------------------------------------------
// ArticleSkeleton
// ---------------------------------------------------------------------------

function ArticleSkeleton({ showDivider }: { showDivider: boolean }) {
  return (
    <>
      <Box sx={{ display: 'flex', gap: 1.5, py: 1.5 }}>
        <Skeleton
          variant="rectangular"
          width={96}
          height={64}
          sx={{ borderRadius: 1, flexShrink: 0 }}
        />
        <Box sx={{ flex: 1 }}>
          <Skeleton width="85%" height={16} sx={{ mb: 0.75 }} />
          <Skeleton width="65%" height={16} sx={{ mb: 0.75 }} />
          <Skeleton width="40%" height={13} sx={{ mb: 0.5 }} />
          <Skeleton width="90%" height={13} />
        </Box>
      </Box>
      {showDivider && <Divider />}
    </>
  )
}

// ---------------------------------------------------------------------------
// NewsFeedCard
// ---------------------------------------------------------------------------

interface NewsFeedCardProps {
  label: string
  result: NewsFeedResult | undefined
  isLoading: boolean
}

export default function NewsFeedCard({
  label,
  result,
  isLoading,
}: NewsFeedCardProps) {
  const theme = useTheme()

  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Card header ──────────────────────────────────────────── */}
      <Box
        sx={{
          px: 2,
          py: 1.25,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.primary.dark, 0.06)} 100%)`,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {result?.status === 'success' && result.channelLogoUrl ? (
          <Box
            component="img"
            src={result.channelLogoUrl}
            alt={label}
            loading="lazy"
            sx={{
              maxWidth: 144,
              maxHeight: 40,
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        ) : (
          <Typography
            sx={{
              fontWeight: 750,
              fontSize: '1rem',
              color: 'primary.main',
              letterSpacing: '0.02em',
            }}
          >
            {label}
          </Typography>
        )}
        {result?.status === 'success' && result.articles.length > 0 && (
          <Chip
            label={`${result.articles.length}`}
            size="small"
            sx={{ fontSize: '0.6rem', height: 18, ml: 'auto' }}
          />
        )}
      </Box>

      {/* ── Card body ────────────────────────────────────────────── */}
      <CardContent sx={{ flex: 1, py: 0, px: 2, '&:last-child': { pb: 1 } }}>
        {isLoading ? (
          // Skeleton: three placeholder articles
          Array.from({ length: 3 }).map((_, i) => (
            <ArticleSkeleton key={i} showDivider={i < 2} />
          ))
        ) : result?.status === 'error' ? (
          // Error state — isolated to this card; other cards remain usable
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 4,
              gap: 1,
            }}
          >
            <ErrorOutline sx={{ color: 'error.main', fontSize: '2rem' }} />
            <Typography
              variant="body2"
              color="error"
              sx={{ textAlign: 'center', fontWeight: 700 }}
            >
              Feed non disponibile
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textAlign: 'center', maxWidth: 240 }}
            >
              {result.message}
            </Typography>
          </Box>
        ) : result?.status === 'success' && result.articles.length === 0 ? (
          // Empty state
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              py: 4,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Nessun articolo disponibile
            </Typography>
          </Box>
        ) : result?.status === 'success' ? (
          // Article list
          result.articles.map((article, i) => (
            <ArticleItem
              key={article.url}
              article={article}
              showDivider={i < result.articles.length - 1}
            />
          ))
        ) : null}
      </CardContent>
    </Card>
  )
}
