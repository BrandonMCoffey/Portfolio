import ImageEmbed from "./ImageEmbed.astro";
import ImageSlider from "./ImageSlider.astro";
import VideoEmbed from "./VideoEmbed.astro";
import CodeSnippet from "./CodeSnippet.astro";
import ProjectHighlight from "./ProjectHighlight.astro";

export const mdxComponents = {
  ImageEmbed,
  ImageSlider,
  VideoEmbed,
  CodeSnippet,
  ProjectHighlight,
};

export { ImageEmbed, ImageSlider, VideoEmbed, CodeSnippet, ProjectHighlight };
export default mdxComponents;
