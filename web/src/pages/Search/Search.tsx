import './models/init'

import { useEffect, useRef } from 'react'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useUnit } from 'effector-react'
import { Search as SearchIcon, X } from 'lucide-react'

import { routes } from '@core/router'

import { AuthLayout } from '@modules/AuthLayout'
import { MeowCard, MeowCardSkeleton } from '@modules/MeowCard'
import { VirtualList } from '@ui/VirtualList'

import {
  $tags,
  $query,
  $selectedTag,
  $meows,
  $hasMore,
  $isOpen,
  $tagsLoaded,
  queryChanged,
  tagSelected,
  cleared,
  loadMore,
  meowLikeToggled,
  dropdownOpened,
  searchQuery
} from './models'

import s from './Search.module.scss'

export const route = routes.search

export const Search = () => {
  const [tags, query, selectedTag, meows, hasMore, isOpen, pending, tagsLoaded] = useUnit([
    $tags, $query, $selectedTag, $meows, $hasMore, $isOpen, searchQuery.$pending, $tagsLoaded
  ])
  const [onQueryChange, onTagSelect, onClear, onLoadMore, onLike, onDropdownOpen] = useUnit([
    queryChanged, tagSelected, cleared, loadMore, meowLikeToggled, dropdownOpened
  ])

  const inputRef = useRef<HTMLInputElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

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
      <title>{t`Поиск / Мяутер`}</title>

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

          {meows.length > 0 && (
            <VirtualList
              items={meows}
              estimateSize={120}
              hasMore={hasMore}
              pending={pending}
              onLoadMore={onLoadMore}
              className={s.list}
              renderItem={(meow) => (
                <MeowCard key={meow.id} meow={meow} onLike={onLike} />
              )}
            />
          )}

          {meows.length === 0 && !pending && (
            <div className={s.empty}>
              <Trans>Нет мяутов по теме ~{selectedTag}</Trans>
            </div>
          )}
        </div>
      )}
    </AuthLayout>
  )
}
