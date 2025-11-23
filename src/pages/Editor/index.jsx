import { useLocation } from "react-router-dom";
import GlassCard from "@components/GlassCard";
import styles from "./Editor.module.css";

export default function Editor() {
	const { state } = useLocation();
	const { svg, imgData } = state || {};

	if (!svg) {
		return (
			<GlassCard className="text-center p-8">
				<h2>No SVG data found</h2>
				<p>Please upload an image first.</p>
			</GlassCard>
		);
	}

	return (
		<GlassCard>
			<div
				className={`flex-center ${styles.svgContainer}`}
				dangerouslySetInnerHTML={{ __html: svg }}
				onClick={(e) => {
					if (e.target.tagName === 'path') {
						e.target.id = styles.svgContainerColouredPath;
					}
				}}
			/>
		</GlassCard>
	);
}
