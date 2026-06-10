<template>
  <div class="graph-wrapper" data-testid="graph-canvas-wrapper">
    <svg ref="svgRef" data-testid="graph-canvas" class="graph-svg" />
  </div>
</template>

<script setup>
import * as d3 from 'd3';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps({
  nodes: {
    type: Array,
    default: () => [],
  },
  links: {
    type: Array,
    default: () => [],
  },
  highlightedNodeIds: {
    type: Array,
    default: () => [],
  },
  highlightedLinkIds: {
    type: Array,
    default: () => [],
  },
  focusNodeId: {
    type: Number,
    default: null,
  },
});

const emit = defineEmits(['node-click', 'node-contextmenu', 'link-contextmenu', 'canvas-click']);
const svgRef = ref(null);
let zoomBehavior = null;
let zoomLayer = null;
let stopSimulation = () => {};

const getWidth = () => svgRef.value?.clientWidth || 960;
const getHeight = () => svgRef.value?.clientHeight || 560;

const render = () => {
  stopSimulation();

  const svg = d3.select(svgRef.value);
  svg.selectAll('*').remove();

  const width = getWidth();
  const height = getHeight();
  svg.attr('viewBox', `0 0 ${width} ${height}`);

  const simulationNodes = props.nodes.map((item) => ({ ...item }));
  const simulationLinks = props.links.map((item) => ({ ...item }));

  const simulation = d3
    .forceSimulation(simulationNodes)
    .force('link', d3.forceLink(simulationLinks).id((d) => d.id).distance(130))
    .force('charge', d3.forceManyBody().strength(-380))
    .force('center', d3.forceCenter(width / 2, height / 2));

  zoomLayer = svg.append('g');
  svg.on('click', () => emit('canvas-click'));

  const link = zoomLayer
    .append('g')
    .attr('stroke-opacity', 0.8)
    .selectAll('line')
    .data(simulationLinks)
    .join('line')
    .attr('stroke', (d) => (props.highlightedLinkIds.includes(d.id) ? '#e11d48' : '#94a3b8'))
    .attr('stroke-width', (d) => Math.max(1.5, d.weight || 1))
    .on('contextmenu', (event, d) => {
      event.preventDefault();
      emit('link-contextmenu', {
        id: d.id,
        source: Number(d.source?.id ?? d.source),
        target: Number(d.target?.id ?? d.target),
        x: event.clientX,
        y: event.clientY,
      });
    });

  const node = zoomLayer
    .append('g')
    .selectAll('circle')
    .data(simulationNodes)
    .join('circle')
    .attr('r', 14)
    .attr('fill', (d) => (props.highlightedNodeIds.includes(d.id) ? '#f97316' : '#2563eb'))
    .attr('stroke', '#ffffff')
    .attr('stroke-width', 2)
    .attr('data-testid', (d) => `graph-node-${d.id}`)
    .on('click', (event, d) => {
      event.stopPropagation();
      emit('node-click', d);
    })
    .on('contextmenu', (event, d) => {
      event.preventDefault();
      emit('node-contextmenu', {
        ...d,
        x: event.clientX,
        y: event.clientY,
      });
    })
    .call(
      d3
        .drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = event.x;
          d.fy = event.y;
        }),
    );

  const label = zoomLayer
    .append('g')
    .selectAll('text')
    .data(simulationNodes)
    .join('text')
    .attr('font-size', 12)
    .attr('font-weight', 600)
    .attr('fill', '#1e293b')
    .attr('dx', 18)
    .attr('dy', 4)
    .text((d) => d.title);

  simulation.on('tick', () => {
    link
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);

    node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
    label.attr('x', (d) => d.x).attr('y', (d) => d.y);
  });

  zoomBehavior = d3
    .zoom()
    .scaleExtent([0.35, 2.5])
    .on('zoom', (event) => {
      zoomLayer.attr('transform', event.transform);
    });

  svg.call(zoomBehavior);

  if (props.focusNodeId) {
    const centerToTarget = () => {
      const targetNode = simulationNodes.find((item) => item.id === props.focusNodeId);
      if (!targetNode || !Number.isFinite(targetNode.x) || !Number.isFinite(targetNode.y)) {
        return false;
      }
      const tx = width / 2 - targetNode.x;
      const ty = height / 2 - targetNode.y;
      const t = d3.zoomIdentity.translate(tx, ty).scale(1.2);
      svg.transition().duration(300).call(zoomBehavior.transform, t);
      return true;
    };

    setTimeout(() => {
      if (!centerToTarget()) {
        simulation.tick(20);
        centerToTarget();
      }
    }, 220);
  }

  stopSimulation = () => {
    if (simulation) {
      simulation.stop();
    }
  };
};

onMounted(() => {
  render();
});

onBeforeUnmount(() => {
  stopSimulation();
});

watch(
  () => [props.nodes, props.links, props.highlightedNodeIds, props.highlightedLinkIds, props.focusNodeId],
  () => {
    if (props.nodes.length) {
      render();
    } else {
      d3.select(svgRef.value).selectAll('*').remove();
    }
  },
  { deep: true },
);
</script>
