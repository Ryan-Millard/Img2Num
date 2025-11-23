import { useQuery } from '@tanstack/react-query';
import GlassCard from '@components/GlassCard';
import styles from './ContributorsCreditsCard.module.css';

const fetchContributors = async () => {
	const res = await fetch(
		'https://api.github.com/repos/Ryan-Millard/Img2Num/contributors?per_page=78'
	);
	if (!res.ok) throw new Error('Failed to fetch contributors');
	return res.json();
};

export default function ContributorsCreditsCard() {
	const { data: contributors = [], isLoading, isError } = useQuery({
		queryKey: ['contributors'],		// must be inside object
		queryFn: fetchContributors,		// must be inside object
		staleTime: 1000 * 60 * 60 * 24 * 7, // 1 week
		cacheTime: 1000 * 60 * 60 * 24 * 7, // 1 week
		refetchOnWindowFocus: false,
		refetchOnMount: false,
	});

	const chunk = (arr, size) =>
		Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
			arr.slice(i * size, i * size + size)
		);

	const chunkSize = 13;
	const tables = chunk(contributors, chunkSize);

	if (isLoading) return <GlassCard>Loading contributors…</GlassCard>;
	if (isError) return <GlassCard>Failed to load contributors</GlassCard>;

	return (
		<GlassCard>
			<h2>Contributors</h2>
			<div className={styles.contributorsGrid}>
				{tables.map((group, i) => (
					<table key={i}>
						<tbody>
							{group.map(c => (
								<tr key={c.id}>
									<td>
										<a href={c.html_url} target="_blank" rel="noopener noreferrer">
											<img
												src={c.avatar_url}
												alt={c.login}
												width="28"
												height="28"
												style={{ borderRadius: '50%' }}
											/>
										</a>
									</td>
									<td>
										<a href={c.html_url} target="_blank" rel="noopener noreferrer">
											{c.login}
										</a>
									</td>
									<td>{c.contributions} commits</td>
								</tr>
							))}
						</tbody>
					</table>
				))}
			</div>
		</GlassCard>
	);
}
