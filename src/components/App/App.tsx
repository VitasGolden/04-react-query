import { useState } from 'react'
import SearchBar from '../SearchBar/SearchBar'
import css from './App.module.css'
import { toast, Toaster } from 'react-hot-toast'
import type { Movie } from '../../types/movie'
import { fetchMovies } from '../../services/movieService'
import MovieGrid from '../MovieGrid/MovieGrid'
import ErrorMessage from '../ErrorMessage/ErrorMessage'
import Loader from '../Loader/Loader'
import MovieModal from '../MovieModal/MovieModal'

export default function App() {
	const [movies, setMovies] = useState<Movie[]>([])
	const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
	const [isError, setIsError] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	const handleSearch = async (query: string) => {
		setMovies([])
		setIsLoading(true)
		setIsError(false)

		try {
			const data = await fetchMovies(query)

			if (data.results.length === 0) {
				toast.error('No movies found for your request.')
				return
			}
			setMovies(data.results)
		} catch {
			setIsError(true)
		} finally {
			setIsLoading(false)
		}
	}

	const handleSelectMovie = (movie: Movie) => {
		setSelectedMovie(movie)
		console.log('Клікнули на фільм:', movie.title)
	}

	return (
		<div className={css.app}>
			<Toaster position='top-center' reverseOrder={false} />
			<SearchBar onSubmit={handleSearch} />
			{isLoading && <Loader />}
			{movies.length > 0 && (
				<MovieGrid movies={movies} onSelect={handleSelectMovie} />
			)}
			{selectedMovie !== null && (
				<MovieModal
					movie={selectedMovie}
					onClose={() => setSelectedMovie(null)}
				/>
			)}
			{isError && <ErrorMessage />}
		</div>
	)
}
