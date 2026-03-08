import './models/init'

import { useEffect, useRef } from 'react'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Helmet } from 'react-helmet-async'
import { useUnit } from 'effector-react'
import { useInView } from 'react-intersection-observer'
import { Search as SearchIcon, X } from 'lucide-react'

import { routes } from '@core/router'

import { AuthLayout } from '@modules/AuthLayout'
import { MeowCard, MeowCardSkeleton } from '@modules/MeowCard'

import {
  $tags,
  $query,
  $selectedTag,
  $meows,
  $hasMore,
  $isOpen,
  $tagsLoaded,
  searchPageOpened,
  queryChanged,
  tagSelected,
  cleared,
  loadMore,
  meowLikeToggled,
  dropdownOpened,
  fetchSearchFx
} from './models'

import s from './Search.module.scss'

export const route = routes.search

export const Search = () => {
  const [tags, query, selectedTag, meows, hasMore, isOpen, pending, tagsLoaded] = useUnit([
    $tags, $query, $selectedTag, $meows, $hasMore, $isOpen, fetchSearchFx.pending, $tagsLoaded
  ])
  const [onOpen, onQueryChange, onTagSelect, onClear, onLoadMore, onLike, onDropdownOpen] = useUnit([
    searchPageOpened, queryChanged, tagSelected, cleared, loadMore, meowLikeToggled, dropdownOpened
  ])

  const inputRef = useRef<HTMLInputElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const { ref, inView } = useInView({ threshold: 0 })

  useEffect(() => {
    onOpen()
  }, [])

  useEffect(() => {
    if (inView && hasMore && !pending) {
      onLoadMore()
    }
  }, [inView, hasMore, pending])

  // закрытие дропдауна при клике вне
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        // не закрываем через событие чтобы не конфликтовать
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // фильтруем теги
  const filteredTags = query.length > 0
    ? tags.filter((tag) => tag.toLowerCase().includes(query.toLowerCase()))
    : tags

  const showDropdown = isOpen && filteredTags.length > 0

  return (
    <AuthLayout title={<Trans>Поиск</Trans>} contentClassName={s.content}>
      <Helmet>
        <title>{t`Поиск / Мяутер`}</title>
      </Helmet>

      <div className={s.searchWrap} ref={wrapRef}>
        <div className={s.inputWrap}>
          <SearchIcon size={18} className={s.searchIcon} />
          <input
            ref={inputRef}
            id="search"
            name="search"
            aria-label={t`Поиск по темам...`}
            className={s.searchInput}
            placeholder={t`Поиск по темам...`}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onFocus={() => onDropdownOpen()}
          />
          {query.length > 0 && (
            <button type="button" aria-label="Очистить" className={s.clearButton} onClick={() => onClear()}>
              <X size={16} />
            </button>
          )}
        </div>

        {showDropdown && (
          <div className={s.dropdown}>
            {filteredTags.map((tag) => (
              <button
                key={tag}
                className={s.tagItem}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onTagSelect(tag)}
              >
                ~{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* нет тегов = пользователь ещё не использовал ~теги */}
      {!selectedTag && tags.length === 0 && tagsLoaded && (
        <div className={s.empty}>
          <Trans>Вы ещё не использовали ~теги в своих мяутах. Напишите мяут с ~темой, чтобы открыть поиск!</Trans>
        </div>
      )}

      {/* ввод не совпал ни с одним тегом */}
      {!selectedTag && tags.length > 0 && query.length > 0 && filteredTags.length === 0 && (
        <div className={s.empty}>
          <Trans>Вы ещё не говорили на эту тему</Trans>
        </div>
      )}

      {selectedTag && (
        <div className={s.results}>
          {pending && meows.length === 0 && (
            <>
              <MeowCardSkeleton />
              <MeowCardSkeleton />
              <MeowCardSkeleton />
            </>
          )}

          {meows.map((meow) => (
            <MeowCard key={meow.id} meow={meow} onLike={onLike} />
          ))}

          {meows.length === 0 && !pending && (
            <div className={s.empty}>
              <Trans>Нет мяутов по теме ~{selectedTag}</Trans>
            </div>
          )}

          {hasMore && (
            <div ref={ref} className={s.sentinel} />
          )}
        </div>
      )}
    </AuthLayout>
  )
}
