// src/data/cv/publications.ts
import type { PublicationItem } from "./types";

export const publications: PublicationItem[] = [
  /*{
    id: "faa-comfort-wear-2026",
    title: "Defining Comfortable Wear Time in Augmented Reality: Ergonomic and Cognitive Trade-offs in Safety-Critical Maintenance Simulations",
    venue: "Peer-Reviewed Academic Publication (In Press)",
    date: "Aug 2026",
    roles: "Author, Developer",
    projectSlug: "vast-faa-techops",
    abstract:
      "This research investigates physical and cognitive wear-time limits for head-mounted augmented reality displays deployed in mission-critical aviation technical maintenance. By measuring eye strain, neck fatigue, and task completion fidelity across extended multi-hour training modules, we propose ergonomic operational thresholds and design guidelines to minimize technician discomfort during complex maintenance simulations.",
  },*/
  /*{
    id: "ackerman-chi-2027",
    title: "Ackerman: Digital Twin for Online Interactions, Learning, and Dialogue",
    venue: "ACM CHI 2027",
    date: "Sep 2026",
    roles: "Author, Developer",
    projectSlug: "utd-ackerman-center",
    abstract:
      "Digital twins of cultural and educational institutions offer novel affordances for remote learning, community engagement, and historical preservation. This paper presents the Ackerman Center Digital Twin, exploring interactive pedagogical techniques, multi-user synchronous dialogues, and spatial audio architectures designed to connect distributed audiences with sensitive historical exhibits and human narratives.",
  },*/
  {
    id: "isap-xr-training-2025",
    title: "Enhancing Human Performance in Aviation Technical Operations Extended Reality (XR) Training Systems Tailored to Human Aptitudes",
    venue: "International Symposium on Aviation Psychology (ISAP 2025)",
    date: "Jun 2025",
    roles: "Author, Developer",
    projectSlug: "vast-faa-techops",
    doi: "https://doi.org/10.5399/osu/1188",
    extraUrl: "https://corescholar.libraries.wright.edu/isap_2025/49/",
    abstract:
      "Aviation maintenance training requires rigorous spatial and procedural comprehension. We evaluate an extended reality (XR) procedural simulator calibrated against individual operator spatial aptitudes. Findings indicate that adaptive spatial scaffolding accelerates task mastery, mitigates cognitive overload, and reduces error rates in safety-critical aircraft systems maintenance.",
  },
  {
    id: "isap-ar-headset-discomfort-2025",
    title: "Augmented Reality for Technical Operations Field Work: Examining the Development and Effects of Headset Discomfort",
    venue: "International Symposium on Aviation Psychology (ISAP 2025)",
    date: "Jun 2025",
    roles: "Author, Developer",
    projectSlug: "vast-faa-techops",
    doi: "https://doi.org/10.5399/osu/1188",
    abstract:
      "Extended deployment of optical see-through AR displays in field technical operations introduces distinct ergonomic hurdles. This empirical study tracks the temporal onset of focal fatigue, craniofacial pressure, and postural adjustments across technicians during technical procedures, yielding actionable recommendations for device weight distribution and procedural pacing.",
  },
  {
    id: "iccgv-football-metaverse-2025",
    title:
      "Advancing the facilitation of social interaction and community engagement among American football enthusiasts through immersive metaverse platform",
    venue: "8th International Conference on Computer Graphics and Virtuality (ICCGV 2025)",
    date: "Apr 2025",
    roles: "Author, Developer",
    projectSlug: "vast-tulsa-union",
    doi: "https://doi.org/10.1117/12.3065862",
    abstract:
      "Immersive web-accessible metaverse platforms offer distributed sports fan bases shared spatial experiences beyond conventional broadcast television. We analyze the architectural pipeline, WebGL optimization, and interactive affordances of a virtual high school football stadium, evaluating user engagement, social presence, and community cohesion among distributed supporters.",
  },
  {
    id: "ieee-vrw-woodbearers-2025",
    title: "Digital Time Machine: A Virtual Reality Reconstruction of the Southwestern Zeitgeist Through the Lens of Clark Hulings' Artistic Legacy",
    venue: "2025 IEEE Conference on Virtual Reality and 3D User Interfaces Abstracts and Workshops (VRW)",
    date: "Mar 2025",
    roles: "Author, Developer",
    projectSlug: "vast-woodbearers",
    doi: "https://doi.org/10.1109/vrw66409.2025.00476",
    abstract:
      "Combining photogrammetric reconstruction, real-time Unreal Engine 5 rendering, and cultural documentation, this project translates the 1970s masterwork 'Woodbearers of Chimayo' into an immersive six-degrees-of-freedom historical environment. We detail our asset optimization pipeline, dynamic lighting model, and qualitative visitor feedback during museum exhibitions.",
  },
  {
    id: "springer-kitty-city-2024",
    title: "Virtual Re-Creation in Augmented Reality for Artistic Expression and Exhibition",
    venue: "Springer Nature — Advances in Haptics and Virtual Reality",
    date: "May 2024",
    roles: "Author, Developer",
    projectSlug: "vast-kitty-city",
    doi: "https://doi.org/10.1007/978-3-031-56521-2_5",
    abstract:
      "Contemporary art museums increasingly leverage augmented reality to bring fragile or non-extant collections to the public. This paper examines the interactive AR pipeline built for Judy Chicago's 'Kitty City' at the New Mexico Museum of Art Vladem Contemporary, highlighting the balance between historical curatorial integrity and real-time mobile graphics performance.",
  },
  {
    id: "ieee-isemv-digital-twin-2024",
    title: "Building a University Digital Twin",
    venue: "2024 IEEE International Symposium on Emerging Metaverse (ISEMV)",
    date: "Oct 2024",
    roles: "Author, Developer",
    projectSlug: "utd-atc-building",
    doi: "https://doi.org/10.1109/ISEMV63338.2024.00018",
    abstract:
      "Creating an interactive, multi-building academic campus digital twin requires harmonizing GIS geospatial data, architectural CAD drawings, and real-time game engine rendering. We present our end-to-end pipeline in Unreal Engine 5, demonstrating cross-platform streaming, interactive wayfinding, and virtual orientation capabilities for prospective students and researchers.",
  },
  {
    id: "acm-vrst-metatwin-2022",
    title: "MetaTwin: Synchronizing Physical and Virtual Spaces for Seamless World",
    venue: "ACM VRST '22: Proceedings of the 28th ACM Symposium on Virtual Reality Software and Technology",
    date: "Nov 2022",
    roles: "Author, Developer",
    projectSlug: "milab-meta-twin",
    doi: "https://doi.org/10.1145/3562939.3565647",
    abstract:
      "MetaTwin explores real-time bidirectional synchronization between physical IoT sensor arrays and interactive virtual reality representations. We demonstrate latency-compensated spatial state replication, spatial telepresence, and user feedback modalities connecting real-world robotics with virtual counterparts.",
  },
  {
    id: "acm-vrst-flow-vis-2022",
    title: "Data Abstraction for Visual and Haptic Representations in Flow Visualization",
    venue: "ACM VRST '22: Proceedings of the 28th ACM Symposium on Virtual Reality Software and Technology",
    date: "Nov 2022",
    roles: "Developer",
    projectSlug: "milab-wind-visualization",
    doi: "https://doi.org/10.1145/3562939.3565651",
    abstract:
      "Visualizing complex multi-dimensional fluid dynamics in three dimensions often overwhelms human perceptual bandwidth. By abstracting vector fields into congruent visual particle streams and focused ultrasound haptic sensations, this work demonstrates improved comprehension and feature discovery in wind flow simulations.",
  },
  {
    id: "acm-vrst-tangible-data-2021",
    title: "TangibleData: Interactive Data Visualization with Mid-Air Haptics",
    venue: "ACM VRST '21: Proceedings of the 27th ACM Symposium on Virtual Reality Software and Technology",
    date: "Dec 2021",
    roles: "Developer",
    projectSlug: "milab-scivis-haptics",
    doi: "https://dl.acm.org/doi/10.1145/3489849.3489889",
    abstract:
      "Mid-air haptics allow users to perceive touch sensations without physical controllers or wearables. We present TangibleData, an interactive scientific visualization workbench that couples volumetric data rendering with ultrasonic acoustic radiation pressure to provide tactile cues for volumetric boundaries and gradients.",
  },
  {
    id: "acm-vrst-thermo-tactile-2021",
    title: "Mid-Air Thermo-Tactile Feedback using Ultrasound Haptic Display",
    venue: "ACM VRST '21: Proceedings of the 27th ACM Symposium on Virtual Reality Software and Technology",
    date: "Dec 2021",
    roles: "Developer",
    projectSlug: "milab-scivis-haptics",
    doi: "https://dl.acm.org/doi/10.1145/3489849.3489889",
    abstract:
      "Integrating thermal feedback with tactile feedback enhances immersion and environmental realism. This paper explores a novel multimodal display combining ultrasound focal point pressure with non-contact radiant thermal stimulation, evaluating human sensory perception thresholds and cross-modal sensory reinforcement.",
  },
];
