# ASCII Art

Welcome to my **ASCII Art** project! This tool allows you to convert images into text-based art using ASCII characters, bringing a fun and creative way to represent images through text.

## The Magic Behind the Algorithm

The core of any ASCII art generation lies in the algorithm that translates images into text. At its most basic, each pixel in the image needs to be represented by a corresponding character from the ASCII set. The challenge here is determining which characters to use for different pixel brightness values.

### Assigning Characters to Pixels

To convert an image into ASCII art, I came up with a way to map pixel brightness values to characters. The brighter pixels are represented by lighter characters, like a space (` `), while darker pixels are represented by denser characters, such as `@` or `#`. This mapping is critical because it impacts the final visual result.

In the `convertToAscii` function, we loop through each pixel, assess its brightness, and select the most suitable character. This step is crucial for producing recognizable images in the final ASCII output.

## Enhancing Image Quality

### Background Removal and Cropping

One major challenge in creating ASCII art is dealing with the background of the images. A cluttered or irrelevant background can make the ASCII art harder to read and detract from the subject of the image. To solve this, I used **background removal** to eliminate unnecessary parts of the image.

I used the `@imgly/background-removal` library to process the image and remove its background before proceeding to the ASCII conversion. This step helped to focus on the main subject, allowing for cleaner and more precise ASCII representations.

After background removal, I needed to crop the image to remove any excess whitespace that could affect the final output. This is done by finding the bounding box of non-transparent pixels around the subject to remove unnecessary areas from the image.

## The Challenges of Displaying ASCII Art

Once the image is converted into ASCII art, the next big hurdle is displaying it in a way that retains the integrity of the original image’s proportions and details. ASCII art doesn't have the same pixel dimensions as images, and this leads to some interesting challenges when rendering it on a screen.

### Aspect Ratio Distortion

One of the main issues with displaying ASCII art is the inherent distortion caused by the font used in text rendering. Text characters are generally taller than they are wide, which results in a **squished aspect ratio** when an image is displayed as ASCII art. To fix this, I needed to adjust the line height using CSS to counter the stretching effect caused by text height and width differences.

This adjustment ensures that the ASCII art is displayed more proportionally, though perfect scaling is still tricky because of the character width-to-height ratio.

### Resizing for Display

The other significant challenge lies in resizing the image for display. While the algorithm works perfectly for converting the image to ASCII art, displaying it as a 1:1 pixel-to-character ratio doesn’t always work because **some images are just too large** to fit comfortably in a text-based format.

I needed to downscale the image to a size that fits within the available screen space, adjusting both the width and height to match the number of characters that can be displayed per line and the number of rows that fit within the viewport. This is achieved through some simple math based on the character width and the viewport size.

## Conclusion

Creating **ASCII art** is an exciting and rewarding challenge, but it comes with its fair share of complexities. From converting pixels into characters based on brightness values to handling background removal and resizing for proper display, every step requires careful thought and attention to detail.

Throughout this project, I’ve learned a lot about **image processing**, **algorithm design**, and **web development techniques** for text rendering. I hope that by sharing these challenges and solutions, others can gain a deeper understanding of how ASCII art generation works and maybe even create their own tools to explore this fascinating form of digital art.

If you want to check out the project, dive into the code, or try it yourself, you can find it on [GitHub](https://github.com/cranberrymuffin/ascii-art). Happy coding, and I hope you enjoy exploring ASCII art as much as I have!
