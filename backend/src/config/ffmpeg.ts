import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

const resolveFfmpegPath = (): string => {
  const envPath = process.env.FFMPEG_PATH?.trim();
  if (envPath) {
    return envPath;
  }

  return ffmpegInstaller.path;
};

export const getFfmpegPath = (): string => resolveFfmpegPath();

export default getFfmpegPath;
