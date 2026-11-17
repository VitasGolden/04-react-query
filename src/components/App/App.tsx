import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import SearchBar from '../SearchBar/SearchBar'
import css from './App.module.css'
import { toast, Toaster } from 'react-hot-toast'
import type { Movie } from '../../types/movie'
import { fetchMovies } from '../../services/movieService'
import MovieGrid from '../MovieGrid/MovieGrid'
import ErrorMessage from '../ErrorMessage/ErrorMessage'
import Loader from '../Loader/Loader'
import MovieModal from '../MovieModal/MovieModal'

import ReactPaginateModule from 'react-paginate'
import type { ReactPaginateProps } from 'react-paginate'
import type { ComponentType } from 'react'

type ModuleWithDefault<T> = { default: T }

const ReactPaginate = (
	ReactPaginateModule as unknown as ModuleWithDefault<
		ComponentType<ReactPaginateProps>
	>
).default

interface PaginationProps {
	totalPages: number
	currentPage: number
	onPageChange: (nextPage: number) => void
}

function Pagination({
	totalPages,
	currentPage,
	onPageChange,
}: PaginationProps) {
	return (
		<ReactPaginate
			pageCount={totalPages}
			pageRangeDisplayed={5}
			marginPagesDisplayed={1}
			onPageChange={({ selected }) => onPageChange(selected + 1)}
			forcePage={currentPage - 1}
			containerClassName={css.pagination}
			activeClassName={css.active}
			nextLabel='→'
			previousLabel='←'
		/>
	)
}

export default function App() {
	const [query, setQuery] = useState('')
	const [page, setPage] = useState(1)
	const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)

	const { data, isLoading, isFetching, isError, isSuccess } = useQuery({
		queryKey: ['movies', query, page],
		queryFn: () => fetchMovies(query, page),
		enabled: query !== '',
		placeholderData: previousData => previousData,
	})

	useEffect(() => {
		if (isSuccess && data?.results.length === 0) {
			toast.error('No movies found for your request.')
		}
	}, [isSuccess, data])

	const handleSearch = (newQuery: string) => {
		setQuery(newQuery)
		setPage(1)
	}

	const handleSelectMovie = (movie: Movie) => {
		setSelectedMovie(movie)
	}

	const movies = data?.results ?? []
	const totalPages = data?.total_pages ?? 0

	return (
		<div className={css.app}>
			<Toaster position='top-center' reverseOrder={false} />
			<SearchBar onSubmit={handleSearch} />

			{isLoading || (isFetching && <Loader />)}
			{isError && <ErrorMessage />}

			{isSuccess && totalPages > 1 && (
				<Pagination
					totalPages={totalPages}
					currentPage={page}
					onPageChange={setPage}
				/>
			)}

			{movies.length > 0 && (
				<MovieGrid movies={movies} onSelect={handleSelectMovie} />
			)}

			{selectedMovie !== null && (
				<MovieModal
					movie={selectedMovie}
					onClose={() => setSelectedMovie(null)}
				/>
			)}
		</div>
	)
}
