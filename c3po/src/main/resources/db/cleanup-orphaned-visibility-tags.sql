-- 清理 orphaned assignment_visibility_tags 记录
-- 删除所有引用了不存在 assignment_id 的记录

DELETE FROM assignment_visibility_tags
WHERE assignment_id NOT IN (SELECT id FROM assignments);

