<script lang="ts">
  import { onMount } from 'svelte';
  import { API_URL, getImageUrl } from '$lib/config';

  interface Staff {
    id: number;
    name: string;
    position: string;
    quote: string;
    image_url: string | null;
  }

  let testimonials: Staff[] = [];
  let currentIndex = 0;
  let loading = true;

  onMount(async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/public/staff-testimonials`);
      if (response.ok) {
        testimonials = await response.json();
      }
    } catch (e) {
      console.error('Error fetching testimonials:', e);
    } finally {
      loading = false;
    }
  });

  function nextSlide() {
    if (testimonials.length > 0) {
      currentIndex = (currentIndex + 1) % testimonials.length;
    }
  }

  function prevSlide() {
    if (testimonials.length > 0) {
      currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
    }
  }

  function goToSlide(index: number) {
    currentIndex = index;
  }

  let autoplayInterval: ReturnType<typeof setInterval>;

  onMount(() => {
    autoplayInterval = setInterval(() => {
      if (testimonials.length > 1) {
        nextSlide();
      }
    }, 5000);

    return () => {
      if (autoplayInterval) clearInterval(autoplayInterval);
    };
  });
</script>

{#if testimonials.length > 0}
  <section class="py-16 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl mb-12">
    <div class="container mx-auto px-4">
      <div class="text-center mb-10">
        <h2 class="text-3xl font-bold text-primary-800 font-serif">Testimoni Guru & Stap Kami</h2>
        <div class="h-1 w-20 bg-primary-500 mx-auto mt-4 rounded-full"></div>
        <p class="text-gray-600 mt-3 max-w-2xl mx-auto">Kata-kata inspiratif dari para pendidik dan tenaga kependidikan kami</p>
      </div>

      {#if loading}
        <div class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      {:else}
        <div class="relative max-w-4xl mx-auto">
          <!-- Quote Icon -->
          <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center shadow-lg z-10">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
            </svg>
          </div>

          <!-- Carousel Container -->
          <div class="bg-white rounded-2xl shadow-2xl p-8 md:p-12 pt-16 relative overflow-hidden">
            {#key currentIndex}
              <div class="animate-fade-in">
                <blockquote class="text-center">
                  <p class="text-lg md:text-xl text-gray-700 italic leading-relaxed mb-8">
                    "{testimonials[currentIndex].quote}"
                  </p>
                </blockquote>
                
                <div class="flex flex-col items-center">
                  {#if testimonials[currentIndex].image_url}
                    <div class="w-32 h-32 mb-6">
                      <img 
                        src={getImageUrl(testimonials[currentIndex].image_url)} 
                        alt={testimonials[currentIndex].name}
                        width="128"
                        height="128"
                        loading="lazy"
                        decoding="async"
                        class="w-full h-full rounded-3xl object-cover object-center border-4 border-primary-200 shadow-xl"
                      />
                    </div>
                  {:else}
                    <div class="w-32 h-32 rounded-3xl bg-primary-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-primary-200 shadow-xl mb-6">
                      {testimonials[currentIndex].name.charAt(0)}
                    </div>
                  {/if}
                  <h4 class="font-bold text-primary-800 text-lg md:text-xl text-center leading-tight max-w-xs sm:max-w-sm break-words">{testimonials[currentIndex].name}</h4>
                  <p class="text-primary-600 text-sm md:text-base text-center">{testimonials[currentIndex].position}</p>
                </div>
              </div>
            {/key}

            <!-- Navigation Arrows -->
            {#if testimonials.length > 1}
              <button 
                on:click={prevSlide}
                class="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary-100 hover:bg-primary-500 text-primary-700 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-md"
                aria-label="Previous testimonial"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                on:click={nextSlide}
                class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary-100 hover:bg-primary-500 text-primary-700 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-md"
                aria-label="Next testimonial"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            {/if}
          </div>

          <!-- Dots Indicator -->
          {#if testimonials.length > 1}
            <div class="flex justify-center mt-6 space-x-2">
              {#each testimonials as _, index}
                <button 
                  on:click={() => goToSlide(index)}
                  class="w-3 h-3 rounded-full transition-all duration-300 {currentIndex === index ? 'bg-primary-500 w-8' : 'bg-primary-300 hover:bg-primary-400'}"
                  aria-label="Go to testimonial {index + 1}"
                ></button>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </section>
{/if}

<style>
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
  }
</style>
