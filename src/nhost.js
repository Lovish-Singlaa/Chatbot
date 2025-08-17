import { NhostClient } from '@nhost/nhost-js';

const nhost = new NhostClient({
  subdomain: import.meta.env.VITE_NHOST_SUBDOMAIN || 'afmwhobwiyqdlrfxqzrn',
  region: import.meta.env.VITE_NHOST_REGION || 'ap-south-1',
});

export default nhost;
