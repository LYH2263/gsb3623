<template>
  <div class="modal-mask" @click.self="$emit('close')">
    <div class="modal-card">
      <header class="modal-title">
        <slot name="title" />
      </header>
      <section class="modal-content">
        <slot />
      </section>
      <footer class="modal-footer">
        <slot name="footer" />
      </footer>
    </div>
  </div>
</template>
