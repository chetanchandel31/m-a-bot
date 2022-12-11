import { AttachmentBuilder, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "src/types";
import { createCanvas, Image, loadImage } from "@napi-rs/canvas";

// Pass the entire Canvas object because you'll need access to its width and context
const applyText = (canvas: any, text: any) => {
  const context = canvas.getContext("2d");

  // Declare a base size of the font
  let fontSize = 100;

  do {
    // Assign the font to the context and decrement it so it can be measured again
    context.font = `bold ${(fontSize -= 10)}px sans-serif`;
    // Compare pixel width of the text to the canvas minus the approximate avatar size
  } while (context.measureText(text).width > canvas.width);

  // Return the result to use in the actual canvas
  return context.font;
};

export const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("cause-of-death")
    .setDescription("a meme template with custom text")
    .addStringOption((option) =>
      option
        .setName("cause")
        .setDescription("Describe the cause")
        .setRequired(true)
        .setMaxLength(50)
    ),
  async execute(interaction) {
    await interaction.reply("preparing ⌛");

    const cause = interaction.options.getString("cause") as string; // it is "required" option so will always be there
    // Create a 700x250 pixel canvas and get its context
    // The context will be used to modify the canvas
    const canvas = createCanvas(552, 333);
    const context = canvas.getContext("2d");

    const background = await loadImage("./src/images/cat.PNG");

    // This uses the canvas dimensions to stretch the image onto the entire canvas
    context.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Assign the decided font to the canvas
    context.font = "bold 38px sans-serif";
    context.fillStyle = "#000000";
    context.textAlign = "center";
    context.fillText("Cause of death", canvas.width / 2, 40);

    //
    context.font = applyText(canvas, cause);
    context.fillStyle = "#000000";
    context.textAlign = "center";
    context.fillText(cause, canvas.width / 2, canvas.height - 5);

    // Use the helpful Attachment class structure to process the file for you
    const attachment = new AttachmentBuilder(await canvas.encode("png"), {
      name: "profile-image.png",
    });

    await interaction.followUp({ files: [attachment] });
    await interaction.deleteReply();
  },
};
