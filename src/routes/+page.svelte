<script lang="ts">
    import * as NavigationMenu from "#lib/components/ui/navigation-menu/index.js";
</script>

<NavigationMenu.Root>
  <NavigationMenu.List>
  <NavigationMenu.Item>
    EcoConsumo
  </NavigationMenu.Item>
    <NavigationMenu.Item>
      <NavigationMenu.Trigger>Documentación</NavigationMenu.Trigger>
      <NavigationMenu.Content>
        <ul class="grid w-50 gap-2 p-4 md:w-75">
          <li>
            <NavigationMenu.Link 
              href="https://www.shadcn-svelte.com/docs/components" 
              class="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
            >
              Shadcn Svelte
            </NavigationMenu.Link>
          </li>
          <li>
            <NavigationMenu.Link 
              href="https://svelte.dev/tutorial/svelte/welcome-to-svelte" 
              class="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
            >
              Tutorial Svelte
            </NavigationMenu.Link>
          </li>
          <li>
            <NavigationMenu.Link 
              href="https://tailwindcss.com/" 
              class="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
            >
              Tailwind CSS
            </NavigationMenu.Link>
          </li>
        </ul>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  </NavigationMenu.List>
</NavigationMenu.Root>