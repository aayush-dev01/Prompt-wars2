export const copyText = async (value: string) => {
  await navigator.clipboard.writeText(value);
};

export const shareText = async (title: string, text: string) => {
  if (!navigator.share) {
    throw new Error('Web Share is not available on this device.');
  }

  await navigator.share({
    title,
    text,
  });
};

export const downloadTextFile = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};
