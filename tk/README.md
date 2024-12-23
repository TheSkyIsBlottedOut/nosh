# Toolkit Folder

This folder is for building tools / workers associated with the project. It also includes a bin folder; this folder and its contents are added to path, and chmodded to executable
when the folder .envrc loads.

If you build utilities here, you may desire to symlink them to the bin folder, or just build then copy the binary to the bin folder.

## Workers

A good pattern for handling node based services is to use the request to queue a task which is exposed to workers with specific privileges in a worker pool. That way, the service can be dedicated to handling requests and the workers can process tasks and update the job queue.

### Distributed Workers

To defray cloud costs, it is often useful to handle non-private data in a distributed worker pool. This can be done with a message queue, or with a distributed worker pool. The simplest way is using an API with DB-as-IPC for the workers to access the tools they need; depending on the data thoroughput, your results may vary.
If you need workers to handle row-by-row data, you may instead opt for a message queue and a worker registry running on a utility image. In this case, you want the workers to avoid table locks and be efficient in polling.

One pattern that stands out is the poller/delegator pattern, where a dedicated worker polls the queue and delegates tasks to workers (via api, database, or queue). This is especially useful in a cloud environment, where you can scale up and down as needed, or handle PII data in a secure manner by granting necessary permissions to those worker pools
but not to the main service.