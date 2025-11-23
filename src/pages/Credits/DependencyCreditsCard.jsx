import { useEffect, useState } from "react";
import GlassCard from "@components/GlassCard";

export default function DependencyCreditsCard() {
	const [deps, setDeps] = useState([]);
	const [devDeps, setDevDeps] = useState([]);

	useEffect(() => {
		const url = "https://raw.githubusercontent.com/Ryan-Millard/Img2Num/main/package.json";

		fetch(url)
			.then(res => res.json())
			.then(async (data) => {
				const dependencies = data.dependencies || {};
				const devDependencies = data.devDependencies || {};

				// Convert objects to arrays with URLs
				const depsWithUrls = await Promise.all(
					Object.entries(dependencies).map(async ([name, version]) => {
						const res = await fetch(`https://registry.npmjs.org/${name}`);
						const info = await res.json();
						const repoUrl = info.repository?.url?.replace(/^git\+/, "").replace(/\.git$/, "") || info.homepage || "";
						return { name, version, url: repoUrl };
					})
				);

				const devDepsWithUrls = await Promise.all(
					Object.entries(devDependencies).map(async ([name, version]) => {
						const res = await fetch(`https://registry.npmjs.org/${name}`);
						const info = await res.json();
						const repoUrl = info.repository?.url?.replace(/^git\+/, "").replace(/\.git$/, "") || info.homepage || "";
						return { name, version, url: repoUrl };
					})
				);

				setDeps(depsWithUrls);
				setDevDeps(devDepsWithUrls);
			});
	}, []);

	const renderTable = (arr) => (
		<table>
			<tbody>
				{arr.map(({ name, version, url }) => (
					<tr key={name}>
						<td>{name}</td>
						<td>{version}</td>
						<td>
							{url ? (
								<a href={url} target="_blank" rel="noopener noreferrer">
									{url}
								</a>
							) : (
								"No URL"
							)}
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);

	return (
		<>
			<GlassCard>
				<h2>Dependencies</h2>
				{renderTable(deps)}
			</GlassCard>

			<GlassCard>
				<h2>Dev Dependencies</h2>
				{renderTable(devDeps)}
			</GlassCard>
		</>
	);
}
