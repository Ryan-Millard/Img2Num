import GlassCard from '@components/GlassCard';

export default function StaticCreditsCard() {
	return (
		<GlassCard>
			<h2>Project Credits</h2>

			<table>
				<tbody>
					<tr>
						<td>Created by</td>
						<td colSpan="2">
							<a href="https://github.com/Ryan-Millard" target="_blank">
								Ryan Millard
							</a>
						</td>
					</tr>

					<tr>
						<td>Related URLs</td>
						<td>
							<a href="https://github.com/Ryan-Millard/Img2Num" target="_blank">
								GitHub Repository
							</a>
						</td>
						<td>
							<a href="https://ryan-millard.github.io/Img2Num/" target="_blank">
								Website on GitHub Pages
							</a>
						</td>
					</tr>

					<tr>
						<td>Media</td>
						<td>Pixel Art Hedgehog</td>
						<td>
						By <a href="https://opengameart.org/users/dustdfg" target="_blank">dustdfg</a>, 
						used under <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank">CC BY-SA 4.0</a>. 
						No modifications. 
						Source: <a href="https://opengameart.org/content/pixel-art-hedgehog" target="_blank">opengameart.org</a>
						</td>
					</tr>
				</tbody>
			</table>
		</GlassCard>
	);
}
