# Claiming Issues

URL: https://img2num.dev/docs/contributing/issues/issue-claims

To help avoid duplicate work, contributors can **claim** an issue before starting work on it.

## Claim an issue

If you'd like to work on an issue, leave the following comment:

Claim an issue

```text
/take
```

The issue will automatically:

- Add a **taken** label.
- Display a banner showing who has claimed it.
- Prevent other contributors from accidentally working on the same issue.
tip
Please only claim an issue if you intend to start working on it soon.

## Release an issue

If you decide not to work on an issue anymore, comment:

Remove your claim on the issue

```text
/untake
```

This removes your claim and makes the issue available for someone else.

## Claim expiration

Issue claims automatically expire after **21 days** of inactivity.

When a claim expires:

- the **taken** label is removed,
- the issue becomes available again,
- the claim banner is updated automatically.
If you're still actively working on an issue after several weeks, simply leave a comment on the issue so maintainers know it is still being worked on.

Commenting doesn't reset the timer
Note that commenting does not reset the 21-day timer; if your claim is about to expire, comment `/untake` followed by `/take` to re-claim it.

## Frequently Asked Questions

### Can I work on an issue that is already claimed?

It is generally discouraged. If you believe the claim has become inactive, leave a comment on the issue or contact a maintainer.

### What if someone else has already opened a pull request?

Only one solution for an issue is typically merged. Checking whether an issue is already claimed or has an open pull request can save everyone time.

### What happens if I forget to `/untake` an issue?

Nothing permanent. Claims automatically expire after 21 days.
