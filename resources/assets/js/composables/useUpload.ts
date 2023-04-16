import isMobile from 'ismobilejs'
import { computed, toRef } from 'vue'
import { settingStore } from '@/stores'
import { acceptedMediaTypes } from '@/config'
import { UploadFile, uploadService } from '@/services'
import { getAllFileEntries, pluralize } from '@/utils'
import { useAuthorization, useMessageToaster, useRouter } from '@/composables'

export const useUpload = () => {
  const { isAdmin } = useAuthorization()
  const { toastSuccess, toastWarning } = useMessageToaster()
  const { go, isCurrentScreen } = useRouter()

  const mediaPath = toRef(settingStore.state, 'media_path')

  const mediaPathSetUp = computed(() => Boolean(mediaPath.value))
  const allowsUpload = computed(() => isAdmin.value && !isMobile.any)

  const fileEntryToFile = async (entry: FileSystemEntry) => new Promise<File>(resolve => entry.file(resolve))

  const queueFilesForUpload = (files: Array<File>) => {
    const uploadCandidates = files
      .filter(file => acceptedMediaTypes.includes(file.type))
      .map((file): UploadFile => ({
        file,
        id: `${file.name}-${file.size}`, // for simplicity, a file's identity is determined by its name and size
        status: 'Ready',
        name: file.name,
        progress: 0
      }))

    uploadService.queue(uploadCandidates)

    return uploadCandidates
  }

  const handleDropEvent = async (event: DragEvent) => {
    if (!event.dataTransfer) {
      return
    }

    const fileEntries = await getAllFileEntries(event.dataTransfer.items)
    const files = await Promise.all(fileEntries.map(entry => fileEntryToFile(entry)))
    const queuedFiles = queueFilesForUpload(files)

    if (queuedFiles.length) {
      toastSuccess(`Queued ${pluralize(queuedFiles, 'file')} for upload`)
      isCurrentScreen('Upload') || go('upload')
    } else {
      toastWarning('No files applicable for upload')
    }
  }

  return {
    mediaPathSetUp,
    allowsUpload,
    handleDropEvent,
    queueFilesForUpload
  }
}
