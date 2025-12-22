# n8n-nodes-fal-ai-media-generate

n8n community node for generating AI media content using the FAL platform. This node supports multiple models for image and video generation.

## Features

- **Multiple AI Models**: Support for various FAL AI models
  - WAN 2.6 Image-to-Video: Generate videos from images
  - Hunyuan Video 1.5 Image-to-Video: Generate videos from images using Hunyuan Video model
  - Gemini 3 Pro Image (Edit): Edit images using AI
  - Gemini 3 Pro Image (Text-to-Image): Generate images from text prompts

- **Flexible Interface Types**: 
  - Asynchronous requests with automatic polling
  - Synchronous requests (for supported models)

- **Comprehensive Parameters**: Full support for all model-specific parameters including resolution, aspect ratio, output format, and more

## Installation

Install this community node in your n8n instance:

```bash
npm install n8n-nodes-fal-ai-media-generate
```

## Setup

1. Get your FAL API Key from [fal.ai](https://fal.ai)
2. In n8n, create a new credential of type "FAL API"
3. Enter your API Key
4. Use the "FAL AI Media Generate" node in your workflows

## Supported Models

### WAN 2.6 Image-to-Video
Generate videos from images with motion based on text prompts.

**Features:**
- Resolution: 720p, 1080p
- Duration: 5, 10, or 15 seconds
- Multi-shot support with intelligent scene segmentation
- Audio support for background music

### Hunyuan Video 1.5 Image-to-Video
Generate videos from images using the Hunyuan Video model.

**Features:**
- Resolution: 480p
- Aspect ratios: 16:9, 9:16
- Configurable number of frames (default: 121)
- Configurable inference steps (default: 28)
- Prompt expansion support
- Negative prompt support

### Gemini 3 Pro Image (Edit)
Edit images using AI with text prompts.

**Features:**
- Multiple image input support
- Various aspect ratios (21:9, 16:9, 3:2, 4:3, 5:4, 1:1, 4:5, 3:4, 2:3, 9:16)
- Resolution options: 1K, 2K, 4K
- Output formats: JPEG, PNG, WebP

### Gemini 3 Pro Image (Text-to-Image)
Generate images from text descriptions.

**Features:**
- Pure text-to-image generation
- Multiple aspect ratios
- Resolution options: 1K, 2K, 4K
- Output formats: JPEG, PNG, WebP
- Web search support for latest information

## Usage

1. Add the "FAL AI Media Generate" node to your workflow
2. Select the model you want to use
3. Choose the interface type (Synchronous or Asynchronous)
4. Fill in the required parameters (prompt, image URLs, etc.)
5. Execute the workflow

## Resources

- [FAL AI Documentation](https://fal.ai/docs)
- [n8n Documentation](https://docs.n8n.io)
- [n8n Community Forum](https://community.n8n.io)

## License

[MIT](LICENSE.md)
